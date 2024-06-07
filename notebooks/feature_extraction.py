import re
import math
import numpy as np
import pandas as pd
import os
import time
from fuzzywuzzy import fuzz
from preprocessing import knn_impute
from utils import remove_empty_columns

def closest_match(word, words_list):
    '''
    Find the closest match to a word in a list of words.
    '''
    max_v = 0
    max_x = ''

    if word == 'Left hip':
        word_options = ['Left hip', 'Left  g trochanter']
    elif word == 'Right hip':
        word_options = ['Right hip', 'Right g trochanter']
    elif word == 'Left toe':
        word_options = ['Left toe', 'Left mth']
    elif word == 'Right toe':
        word_options = ['Right toe', 'Right mth']
    else:
        word_options = [word]

    for option in word_options:
        for x in words_list:
            ratio = fuzz.token_sort_ratio(option.lower(), x.lower())
            if ratio > max_v:
                max_v = ratio
                max_x = x

    return max_v, max_x


def match_col_names(columns):
    '''
    Match column names to the expected format. 
    If there are any missing, or if the names are not close enough to the expected format, return False. 
    Else, return a dictionary of the column names to be renamed.
    '''

    # Left or lt, right or rt -> heel, toe, knee, ankle, hip or g trochanter, shoulder or mth
    #
    params = ['heel', 'toe', 'knee', 'ankle',
              'hip', 'shoulder']

    def lt(x): return 'Left '+x
    def rt(x): return 'Right '+x
    col_names = [f(x) for x in params for f in (lt, rt)]

    # hip -> right.g.trochanter, left.g.trochanter
    # toe -> right.mth, left.mth

    missing_cols = []
    rename_cols = {}
    for c in col_names:
        fuzz_ratio, cl_match = closest_match(c, columns)
        rename_cols[cl_match] = c
        if fuzz_ratio < 80:
            missing_cols.append(c)

    print('{:<25} {}'.format("Columns in CSV", 'Mapped Column'))
    print('{:<25} {}'.format("______________", '_____________'))
    for key, value in rename_cols.items():
        print('{:<25} {}'.format(key, value))

    # add 1 sec delay here
    time.sleep(0.5)

    check = input('\ncheck if column mapping is correct (y/n): ')

    if (check == 'n') or (check == 'N'):
        print('______________________________')
        print('\nPossible missing columns in file: ', missing_cols,
              '\nRename or add appropriate columns, and try again.')
        return
    else:
        return rename_cols


def cal_seg_angles(up_marker, low_marker):
    '''
    Calculate segment angles.
    '''

    xs = up_marker.iloc[:, 0] - low_marker.iloc[:, 0]
    ys = up_marker.iloc[:, 2] - low_marker.iloc[:, 2]

    angles = []
    for x, y in zip(xs, ys):
        if x == 0:
            angle = math.pi / 2
        else:
            angle = math.atan2(y, x)

        angles.append(math.degrees(angle))

    return angles


def extract_JNT_df(df):
    '''
    Extract joint angles from motion dataframe.
    return: joint angle dataframe

    Here, we calculate the angles between the segments like following:
    foot (left, right) -> heel(up_marker), toe (low_marker)
    shank (left, right) -> knee(up_marker), ankle (low_marker)
    thigh (left, right) -> hip(up_marker), knee (low_marker)
    trunk (left, right) -> (shoulder(up_marker) + hip(low_marker)) / 2
    '''

    def process_row(row, foot):
        time_value = row['time']
        foot_value = row[foot]
        
        if foot_value < -150:
            row[foot] = foot_value + 360
       
        return row

    df_jnt = pd.DataFrame()

    df_jnt['time'] = df['time'].reset_index(drop=True)
    df_jnt['#frame'] = df['frame#'].reset_index(drop=True)

    seg = ['foot', 'shank', 'thigh', 'trunk']
    mot = [('heel', 'toe'), ('knee', 'ankle'),
           ('hip', 'knee'), ('shoulder', 'hip')]

    
    for i in range(len(seg)):
        up_marker_rt = df['Right '+mot[i][0]].astype(float)
        up_marker_lt = df['Left '+mot[i][0]].astype(float)
        low_marker_rt = df['Right '+mot[i][1]].astype(float)
        low_marker_lt = df['Left '+mot[i][1]].astype(float)

        angles_rt = cal_seg_angles(up_marker_rt, low_marker_rt)
        angles_rt = pd.Series(angles_rt, dtype=float)

        angles_lt = cal_seg_angles(up_marker_lt, low_marker_lt)
        angles_lt = pd.Series(angles_lt, dtype=float)

        if (seg[i] == 'trunk'):
            df_jnt['trunk'] = (angles_rt + angles_lt) / 2

        else:
            df_jnt['R'+seg[i]] = angles_rt
            df_jnt['L'+seg[i]] = angles_lt

    # print(df['Left hip'].iloc[:, 0].astype(float))
    df_jnt['hipx'] = (df['Left hip'].iloc[:, 0].astype(float) + df['Right hip'].iloc[:, 0].astype(float)) / (2 * 1000)

    if (df_jnt['Rfoot'] > 150).any():
        df_jnt['Rfoot'] = df_jnt['Rfoot'] - 180
    if(df_jnt['Lfoot'] > 150).any():
        df_jnt['Lfoot'] = df_jnt['Lfoot'] - 180

    # For 'Rfoot', 'Lfoot', if the value is < -150 add 360 to it
    for foot in ['Rfoot', 'Lfoot']:
        df_jnt[foot] = df_jnt[foot].astype(float)
        df_jnt = df_jnt.apply(process_row, axis=1, args=(foot,))

    start_time = 0
    end_time = df_jnt['time'].iloc[-1]
    new_time = np.arange(start_time, end_time, 1/120)
    new_time = np.append(new_time, df_jnt['time'].iloc[-1])
    # remove first element from new_time
    new_time = new_time[1:]

    new_df_jnt = pd.DataFrame(index=new_time)

    # Interpolate the values for the new time intervals
    for column in df_jnt.columns:
        if column != 'time':
            new_df_jnt[column] = np.interp(new_time, df_jnt['time'], df_jnt[column])

    new_df_jnt['time'] = new_time
    new_df_jnt = new_df_jnt.reset_index(drop=True)

    return new_df_jnt

def motionToJointAngle(df, save = False, replace = False):

    columns = list(set(df.columns))
    columns = [c[0] for c in columns]
    columns = [c for c in columns if c not in ('frame#', 'time')]
    columns = list(set(columns))

    rename_cols = match_col_names(columns)
    if rename_cols is None:
        return
    else:
        df = df.rename(columns=rename_cols)

    df = extract_JNT_df(df)

    return df
    
def extract_sptmp(filepath, pid, trial):
    jnts = pd.read_csv(filepath + '/' + pid + '/' + pid + "_" + str(trial) + "_jnt.csv")
    jnts  = remove_empty_columns(jnts)
    jnts = knn_impute(jnts, data_type='jnt')
    
    # grfs = pd.read_csv(filepath + '/' + pid + '/' + pid + "_" + str(trial) + "_grf.csv")
    dem = pd.read_csv(filepath + '/' + "demographic.csv")

    sts = pd.read_csv(filepath + "/" + pid + '/' + pid + "step.csv")

    jnts.columns = jnts.columns.str.strip()
    # grfs.columns = grfs.columns.str.strip()
    dem.columns = dem.columns.str.strip()

    thigh = dem[dem['id'] == pid]['thigh'].values[0]
    shank = dem[dem['id'] == pid]['shank'].values[0]

    first_step = sts[sts['trial'] == trial].footing.values[0]
    trials = list(sts['trial'])

    trial_index = trials.index(trial)

    TDs = sts.filter(like='touch').values[trial_index]
    LOs = sts.filter(like='off').values[trial_index]

    timeswing1 = LOs[1] - TDs[1]
    timeswing2 = LOs[0] - TDs[0]
    timegait1 = TDs[3] - TDs[1]
    timegait2 = TDs[2] - TDs[0]

    timeRswing = timeswing1 if first_step == 'L' else timeswing2
    timeLswing = timeswing2 if first_step == 'L' else timeswing1
    timeRgait = timegait1 if first_step == 'L' else timegait2
    timeLgait = timegait2 if first_step == 'L' else timegait1

    Rshank = jnts.Rshank.values/180*np.pi
    Lshank = jnts.Lshank.values/180*np.pi
    Rthigh = jnts.Rthigh.values/180*np.pi
    Lthigh = jnts.Lthigh.values/180*np.pi
    hipx = jnts.hipx.values

    # Nan values in hipx
    # if(type(hipx[0]) == str):
    #     hipx = np.array([float(value.strip()) if value.strip().lower() != 'nan' else np.nan for value in hipx])
    

    TD1 = int(round(TDs[0]*120))
    TD2 = int(round(TDs[1]*120))
    TD3 = int(round(TDs[2]*120))

    if(first_step == 'R'):
        RstepLength = -np.cos(Rthigh[TD1])*thigh - np.cos(Rshank[TD1])*shank + np.cos(Lthigh[TD1])*thigh + np.cos(Lshank[TD1])*shank
        LstepLength =  np.cos(Rthigh[TD2])*thigh + np.cos(Rshank[TD2])*shank - np.cos(Lthigh[TD2])*thigh - np.cos(Lshank[TD2])*shank

    else:
        RstepLength = -np.cos(Rthigh[TD2])*thigh - np.cos(Rshank[TD2])*shank + np.cos(Lthigh[TD2])*thigh + np.cos(Lshank[TD2])*shank
        LstepLength =  np.cos(Rthigh[TD1])*thigh + np.cos(Rshank[TD1])*shank - np.cos(Lthigh[TD1])*thigh - np.cos(Lshank[TD1])*shank

    GaitSpeed = np.mean((np.diff(hipx)*120)[TD1-1:TD3])

    return RstepLength, LstepLength, timeRswing, timeLswing, timeRgait, timeLgait, GaitSpeed

def get_sptmp_params(file_location, pid):
    files = os.listdir(file_location + "/" + pid)

    pattern = r'_(\d+)_'
    trials = set()

    for filename in files:
        matches = re.findall(pattern, filename)
        for match in matches:
            trials.add(int(match))

    # Convert the set to a sorted list to display the trial numbers in order
    trials = sorted(list(trials))

    stpParams = []

    for trial in trials:
        RstepLength, LstepLength, timeRswing, timeLswing, timeRgait, timeLgait, GaitSpeed = extract_sptmp(file_location, pid, trial)
        stpParams.append([pid, trial, RstepLength, LstepLength, timeRswing, timeLswing, timeRgait, timeLgait, GaitSpeed])

    df = pd.DataFrame(stpParams, columns=['sid', 'trial', 'RstepLength', 'LstepLength', 'timeRswing', 'timeLswing', 'timeRgait', 'timeLgait', 'GaitSpeed'])

    return df

def mark_step_times(file_dir, patient_id, trial, L, R, trialtype):

    if(L[0][0] < L[1][0]):
        p1, p2, p3, p4 = L[0], R[0], L[1], R[1]
        f1, f2, f3, f4 = 'L', 'R', 'L', 'R'
    else:
        p1, p2, p3, p4 = R[0], L[0], R[1], L[1]
        f1, f2, f3, f4 = 'R', 'L', 'R', 'L'

    if os.path.exists('%s/%s/%sstep.csv' % (file_dir, patient_id, patient_id)):
        df_step = pd.read_csv('%s/%s/%sstep.csv' % (file_dir, patient_id, patient_id))
        
        if not df_step[(df_step['trial'] == trial) & (df_step['trialtype'] == trialtype)].empty:
            print('Step time for trial already exists. Do you want to overwrite: ? (y/n)')
            time.sleep(0.5)
            answer = input()
            if answer == 'y':
                new_row = {'subject': patient_id, 'trial': trial, 'trialtype': trialtype, 'touch down': p1[0], 'toe off': p1[1], 'footing': f1, 'touch down.1': p2[0], 'toe off.1': p2[1], 'footing.1': f2, 'touch down.2': p3[0], 'toe off.2': p3[1], 'footing.2': f3, 'touch down.3': p4[0], 'toe off.3': p4[1], 'footing.3': f4}
                df_step = df_step[(df_step['trial'] != trial) & (df_step['trialtype'] != trialtype)]
                df_step = pd.concat([df_step, pd.DataFrame(new_row, index=[0])], ignore_index=True)

                df_step = df_step.sort_values(by=['subject', 'trial'])
                df_step = df_step.reset_index(drop=True)

                df_step.columns = ['subject', 'trial', 'trialtype', 'touch down', 'toe off', 'footing', 'touch down', 'toe off', 'footing', 'touch down', 'toe off', 'footing', 'touch down', 'toe off', 'footing']
                df_step.to_csv('%s/%s/%sstep.csv' % (file_dir, patient_id, patient_id), index=False)
            else:
                print('Not overwriting')
        
        else:
            new_row = {'subject': patient_id, 'trial': trial, 'trialtype': trialtype, 'touch down': p1[0], 'toe off': p1[1], 'footing': f1, 'touch down.1': p2[0], 'toe off.1': p2[1], 'footing.1': f2, 'touch down.2': p3[0], 'toe off.2': p3[1], 'footing.2': f3, 'touch down.3': p4[0], 'toe off.3': p4[1], 'footing.3': f4}
            df_step = pd.concat([df_step, pd.DataFrame(new_row, index=[0])], ignore_index=True)

            df_step = df_step.sort_values(by=['subject', 'trial'])
            df_step = df_step.reset_index(drop=True)

            df_step.columns = ['subject', 'trial', 'trialtype', 'touch down', 'toe off', 'footing', 'touch down', 'toe off', 'footing', 'touch down', 'toe off', 'footing', 'touch down', 'toe off', 'footing']
            df_step.to_csv('%s/%s/%sstep.csv' % (file_dir, patient_id, patient_id), index=False)

    else:
        new_row = {'subject': patient_id, 'trial': trial, 'trialtype': trialtype, 'touch down': p1[0], 'toe off': p1[1], 'footing': f1, 'touch down.1': p2[0], 'toe off.1': p2[1], 'footing.1': f2, 'touch down.2': p3[0], 'toe off.2': p3[1], 'footing.2': f3, 'touch down.3': p4[0], 'toe off.3': p4[1], 'footing.3': f4}
        df_step = pd.DataFrame(new_row, index=[0])
        df_step.columns = ['subject', 'trial', 'trialtype', 'touch down', 'toe off', 'footing', 'touch down', 'toe off', 'footing', 'touch down', 'toe off', 'footing', 'touch down', 'toe off', 'footing']
        df_step.to_csv('%s/%s/%sstep.csv' % (file_dir, patient_id, patient_id), index=False)

    return
