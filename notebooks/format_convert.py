import warnings
import c3d
from scipy.io import loadmat
# from trc import TRCData
import numpy as np
import pandas as pd
import os


warnings.filterwarnings(
    "ignore", message="No analog data found in file.")


def trcToCSV(file_dir, patient_id, trial_no, replace = False):
    """
    To get metadata from trc file:
    mocap_data = TRCData()
    mocap_data.load(fildir)

    #  'DataRate', 'CameraRate', 'NumFrames', 'NumMarkers', 'Units', 'OrigDataRate', 
    #  'OrigDataStartFrame', 'OrigNumFrames', 'OrigNumMarkers'
    #  Ex: mocap_data['NumFrames']
    """
    
    file = file_dir + '/' + patient_id + '/' + patient_id + '_' + str(trial_no) + '.trc'
    # find the line number where the data starts
    with open(file, 'r') as f:
        for line_count, line in enumerate(f, start=1):
            if any(word.lower() in line for word in ['frame#', 'time', 'head', 'ear', 'shoulder', 'elbow', 'wrist', 'hand', 'hip', 'knee', 'ankle', 'foot',
                                                     'toe', 'sacrum', 'scapula', 'tibia', 'g.trochanter', 'heel', 'mth', 'thigh', 'fixed', 'fix']):
                break

    # skip the lines before the data starts and read the data
    df = pd.read_csv(file, delimiter="\t",
                     skiprows=[i for i in range(line_count-1)], header=[0, 1])

    # drop a row if all values are NaN (in trc file, apparently they skip a line after column names)
    df = df.dropna(how='all')

    col_tuples = []
    for i in range(len(df.columns)):
        c = df.columns[i]
        if (c[0] == 'Frame#'):
            tup = list(('frame#', ''))
            c = tuple(tup)
        elif (c[0] == 'Time'):
            tup = list(('time', ''))
            c = tuple(tup)
        else:
            if (c[0].split(':')[0] == 'Unnamed'):
                c = (z, c[1][0])
            else:
                z = c[0].split(':')[0]
                c = (z, c[1][0])

        col_tuples.append(c)

    df_cols = pd.MultiIndex.from_tuples(col_tuples)
    df.columns = df_cols

    save_filepath = file_dir + '/' + patient_id + '/' + patient_id + '_' + str(trial_no) + '.csv'
    if(replace or not os.path.exists(save_filepath)):
        df.to_csv(save_filepath, index=False)
        print('File saved as %s_%s.csv' % (patient_id, trial_no), '\n')
    else:
        i = 1
        while os.path.exists(file_dir + '/' + patient_id + '/' + patient_id + '_' + str(trial_no) + '_' + str(i) + '.csv'):
            i += 1
        df.to_csv(file_dir + '/' + patient_id + '/' + patient_id + '_' + str(trial_no) + '_' + str(i) + '.csv', index=False)
        print('File saved as %s_%s_%s.csv' % (patient_id, trial_no, i), '\n')

    return df


def matToCSV(file_dir, patient_id, trial_no, replace = False):
    '''
    Read the MAT file into a Pandas dataframe.
    '''

    file = file_dir + '/' + patient_id + '/' + patient_id + '_' + str(trial_no) + '.mat'
    annots = loadmat(file, squeeze_me=True)
    # struct = annots['qtm_022318xz0004']
    struct = annots[list(annots.keys())[3]]

    col_names = struct.item()[5].item()[0].item()[1]

    col_tuples = []
    for c in col_names:
        col_tuples.extend([(c, 'X'), (c, 'Y'), (c, 'Z')])

    arr3d = struct.item()[5].item()[0].item()[2]

    df = pd.DataFrame()
    cnt = 0

    for arr2d in arr3d:
        for i in range(3):
            cnt += 1
            col = arr2d[i]
            df[str(cnt)] = pd.Series(col)

    df_cols = pd.MultiIndex.from_tuples(col_tuples)
    df.columns = df_cols

    frame_no = annots[list(annots.keys())[3]].item()[3]
    frame_rate = annots[list(annots.keys())[3]].item()[4]

    col_frames = [i for i in range(1, int(frame_no)+1)]
    col_time = [i/frame_rate for i in range(0, int(frame_no))]

    df.insert(loc=0,
              column='frame#',
              value=col_frames)

    df.insert(loc=1,
              column='time',
              value=col_time)

    save_filepath = file_dir + '/' + patient_id + '/' + patient_id + '_' + str(trial_no) + '.csv'
    if(replace or not os.path.exists(save_filepath)):
        df.to_csv(save_filepath, index=False)
        print('File saved as %s_%s.csv' % (patient_id, trial_no), '\n')
    else:
        i = 1
        while os.path.exists(file_dir + '/' + patient_id + '/' + patient_id + '_' + str(trial_no) + '_' + str(i) + '.csv'):
            i += 1
        df.to_csv(file_dir + '/' + patient_id + '/' + patient_id + '_' + str(trial_no) + '_' + str(i) + '.csv', index=False)
        print('File saved as %s_%s_%s.csv' % (patient_id, trial_no, i), '\n')

    return df


def c3dToCSV(file_dir, patient_id, trial_no, replace = False):

    file = file_dir + '/' + patient_id + '/' + patient_id + '_' + str(trial_no) + '.c3d'
    with open(file, "rb") as handle:
        reader = c3d.Reader(handle)
        frames = []

        for i, points, analog in reader.read_frames():
            frames.append(points[:, :3].flatten().tolist())

        col_names = reader.point_labels

        col_tuples = []
        for c in col_names:
            col_tuples.extend(
                [(c.strip(), 'X'), (c.strip(), 'Y'), (c.strip(), 'Z')])

        frame_no = reader.frame_count
        frame_rate = reader.point_rate

        col_frames = [i for i in range(1, int(frame_no)+1)]
        col_time = [i/frame_rate for i in range(0, int(frame_no))]

        df = pd.DataFrame(frames, columns=col_tuples)
        df.columns = pd.MultiIndex.from_tuples(df.columns)

        # Because points are 0 instead of nan while reading in 115-116th line
        df.replace(0, np.nan, inplace=True)

        df.insert(loc=0,
                  column='frame#',
                  value=col_frames)

        df.insert(loc=1,
                  column='time',
                  value=col_time)

    save_filepath = file_dir + '/' + patient_id + '/' + patient_id + '_' + str(trial_no) + '.csv'
    if(replace or not os.path.exists(save_filepath)):
        df.to_csv(save_filepath, index=False)
        print('File saved as %s_%s.csv' % (patient_id, trial_no), '\n')
    else:
        i = 1
        while os.path.exists(file_dir + '/' + patient_id + '/' + patient_id + '_' + str(trial_no) + '_' + str(i) + '.csv'):
            i += 1
        df.to_csv(file_dir + '/' + patient_id + '/' + patient_id + '_' + str(trial_no) + '_' + str(i) + '.csv', index=False)
        print('File saved as %s_%s_%s.csv' % (patient_id, trial_no, i), '\n')

        return df
