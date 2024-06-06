import re
import math
from utils import *
import numpy as np
import pandas as pd
import os
from preprocessing import knn_impute

def motionToJointAngle(save = False, replace = False, **kwargs):

    if('dataframe' in kwargs):
        df = kwargs['dataframe']
        columns = list(set(df.columns))
    else:
        df = pd.read_csv('%s/%s/%s_%s.csv' % (kwargs['file_dir'], kwargs['patient_id'], kwargs['patient_id'], kwargs['trial']), header=None)
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

    if(save):
        pid = kwargs['patient_id']
        trial = kwargs['trial']
        file_location = kwargs['file_dir']
        savepath = '%s/%s/%s_%s_%s.csv' % (file_location, pid, pid, trial, 'jnt')
        if(replace or not os.path.exists(savepath)):
            df.to_csv('%s/%s/%s_%s_%s.csv' % (file_location, pid, pid, trial, 'jnt'), index=False)
        else:
            df.to_csv('%s/%s/%s_%s_%s_j.csv' % (file_location, pid, pid, trial, 'jnt'), index=False)

    return df
    
def extract_stp(filepath, pid, trial):
    jnts = pd.read_csv(filepath + '/' + pid + '/' + pid + "_" + str(trial) + "_jnt.csv")
    jnts = knn_impute(dataframe = jnts, data_type='jnt')
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

def get_stp_params(file_location, pid, save = False, replace = False):
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
        savepath = file_location + '/' + pid + '/' + pid + 'sptemp.csv'
        if(replace == True or not os.path.exists(savepath)):
            df.to_csv(file_location + '/' + pid + '/' + pid + 'sptmp.csv', index=False)
        else:
            df.to_csv(file_location + '/' + pid + '/' + pid + 'sptmp_n.csv', index=False)

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
