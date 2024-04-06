import re
import math
from utils import *
import numpy as np
import pandas as pd
import os

def motionToJointAngle(file_location, patient_id, trial, save = False):
    '''
    Convert motion file to joint angle file
    Input: motion file (CSV)
    Output: joint angle file (CSV)
    '''
    file = file_location + '/' + patient_id + '/' + patient_id + '_' + str(trial) + '.csv'
    df = pd.read_csv(file, header=None)

    columns = df.iloc[:2]
    df = df.iloc[2:]
    columns = columns.fillna('')

    columns = pd.MultiIndex.from_arrays(columns.values.tolist())
    df.columns = columns

    columns = [c[0] for c in columns]

    columns = [c for c in columns if c not in ('frame#', 'time')]
    columns = list(set(columns))

    rename_cols = match_col_names(columns)
    if rename_cols is None:
        return
    else:
        df = df.rename(columns=rename_cols)

        df = extract_JNT_df(df)

        # Extract filename using regex
        # regex = r"([^\\\/]+?)(?=\.csv)"
        # match = re.search(regex, file_dir)
        # filename = (match.group(1))

        # pattern = r".+\/(?=[^\/]+\.csv)"
        # match = re.search(pattern, file_dir)
        # filepath = match.group(0) if match else None

        if(save == True): df.to_csv(file_location + '/' + patient_id + '/' + patient_id + '_' + str(trial) + '_jnt.csv', index=False)

        # os.makedirs('data/output', exist_ok=True)
        # df.to_csv('data/output/' + filename + '_jnt.csv', index=False)

        return df
    
def extract_stp(filepath, pid, trial):
    jnts = pd.read_csv(filepath + '/' + pid + '/' + pid + "_" + str(trial) + "_jnt.csv")
    grfs = pd.read_csv(filepath + '/' + pid + '/' + pid + "_" + str(trial) + "_grf.csv")

    sts = pd.read_csv(filepath + "/" + pid + '/' + pid + "step.csv")
    
    first_step = sts[sts['trial'] == trial].footing.values[0]
    trials = list(sts['trial'])
    
    trial_index = trials.index(trial)

    TDs = sts.filter(like='touch').values[trial_index]
    LOs = sts.filter(like='off').values[trial_index]

    timeswing1 = LOs[1] - TDs[1]  # right swing phase
    timeswing2 = LOs[0] - TDs[0]
    timegait1 = TDs[3] - TDs[1]  # right gait cycle
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
    if(type(hipx[0]) == str):
        hipx = np.array([float(value.strip()) if value.strip().lower() != 'nan' else np.nan for value in hipx])
        hipx = hipx[~np.isnan(hipx.astype(float))]

    TD1 = int(round(TDs[1]*120))
    TD2 = int(round(TDs[2]*120))
    TD3 = int(round(TDs[3]*120))

    if(first_step == 'L'):
        RstepLength = -np.cos(Rthigh[TD1]) -np.cos(Rshank[TD1]) + np.cos(Lthigh[TD1]) + np.cos(Lshank[TD1])
        LstepLength = np.cos(Rthigh[TD2]) + np.cos(Rshank[TD2]) - np.cos(Lthigh[TD2]) - np.cos(Lshank[TD2])

    else:
        RstepLength = -np.cos(Rthigh[TD2]) -np.cos(Rshank[TD2]) + np.cos(Lthigh[TD2]) + np.cos(Lshank[TD2])
        LstepLength = np.cos(Rthigh[TD1]) + np.cos(Rshank[TD1]) - np.cos(Lthigh[TD1]) - np.cos(Lshank[TD1])

    GaitSpeed = np.mean((np.diff(hipx)*120)[TD1-1:TD3])

    return RstepLength, LstepLength, timeRswing, timeLswing, timeRgait, timeLgait, GaitSpeed

def get_stp_params(file_location, pid, save = False):
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
        RstepLength, LstepLength, timeRswing, timeLswing, timeRgait, timeLgait, GaitSpeed = extract_stp(file_location, pid, trial)
        stpParams.append([pid, trial, RstepLength, LstepLength, timeRswing, timeLswing, timeRgait, timeLgait, GaitSpeed])

    df = pd.DataFrame(stpParams, columns=['sid', 'trial', 'RstepLength', 'LstepLength', 'timeRswing', 'timeLswing', 'timeRgait', 'timeLgait', 'GaitSpeed'])

    if save == True:
        df.to_csv(file_location + '/' + pid + '/' + pid + '_stp.csv', index=False)

    return df

# def filterJntGrf(patient, trial):

#     touch_downs, toe_offs = getTouchDownToeOff(patient, trial)

#     # start time is 0.3s before the first touch down
#     start_time = touch_downs[0] - 0.5

#     # end time is 0.3s after the last toe off
#     end_time = toe_offs[len(touch_downs) - 1] + 0.5

#     # read joint angle file of the trial
#     trial_df_jnt = pd.read_csv(
#         'data/input/20 trials/%s_%s_jnt.csv' % (patient, trial))

#     # read ground reaction force file of the trial
#     trial_df_grf = pd.read_csv(
#         'data/input/20 trials/%s_%s_grf.csv' % (patient, trial))

#     trial_df_jnt = filter_data(trial_df_jnt, start_time, end_time)
#     trial_df_grf = filter_data(trial_df_grf, start_time, end_time)

#     # save filtered joint angle file
#     trial_df_jnt.to_csv('data/output/%s_%s_jnt_filtered.csv' %
#                         (patient, trial), index=False)

#     # save filtered ground reaction force file
#     trial_df_grf.to_csv('data/output/%s_%s_grf_filtered.csv' %
#                         (patient, trial), index=False)

#     return trial_df_jnt, trial_df_grf
