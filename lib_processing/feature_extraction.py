import re
import math
from utils import *
import pandas as pd
import os


def motionToJointAngle(file_dir):
    '''
    Convert motion file to joint angle file
    Input: motion file (CSV)
    Output: joint angle file (CSV)
    '''

    df = pd.read_csv(file_dir, header=None)

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
        regex = r"([^\\\/]+?)(?=\.csv)"
        match = re.search(regex, file_dir)
        filename = (match.group(1))

        os.makedirs('data/output', exist_ok=True)
        df.to_csv('data/output/' + filename + '_jnt.csv', index=False)

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
