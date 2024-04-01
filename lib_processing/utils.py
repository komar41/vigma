from fuzzywuzzy import fuzz
import math
import pandas as pd
import matplotlib.pyplot as plt
from matplotlib.patches import Rectangle
import os


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
            df_jnt['Trunk'] = (angles_rt + angles_lt) / 2

        else:
            df_jnt['R'+seg[i]] = angles_rt
            df_jnt['L'+seg[i]] = angles_lt

    return df_jnt


def getTouchDownToeOff(patient, trial):
    '''
    Extract touch down and toe off times from step file.
    return: touch down and toe off times
    '''

    df = pd.read_csv('data/input/20 trials/%sstep.csv' %
                     (patient))  # read step file of one trial of a patient

    touch_down_cols = [col for col in df.columns if 'touch down' in col]

    # get all toe off columns
    toe_off_cols = [col for col in df.columns if 'toe off' in col]

    touch_downs = [df[df['trial'] == trial][col].values[0]
                   for col in touch_down_cols]  # get all touch down values

    toe_offs = [df[df['trial'] == trial][col].values[0]
                for col in toe_off_cols]  # get all toe off values

    return touch_downs, toe_offs


def select_df(df, start_time, end_time):

    df = df[(df['time'] >= start_time) & (
        df['time'] <= end_time)]  # filter joint angle file

    return df


def remove_empty_columns(df):
    df = df.loc[:, ~df.columns.str.contains(
        '^Unnamed')]  # remove empty named columns

    df = df.drop(
        columns=[col for col in df.columns if col.isspace()])  # remove empty string named columns

    return df


def file_or_df(data):
    if (isinstance(data, pd.DataFrame)):
        df = data
    else:
        df = pd.read_csv(data)

    return df


def save_csv(df, file_name):
    df.to_csv(file_name, index=False)
    return


def plot_line(data, **kwargs):

    if isinstance(data, pd.DataFrame):
        df = data
    elif isinstance(data, str):
        df = pd.read_csv(data)

    df = remove_empty_columns(df)

    if ('cols' in kwargs):
        cols = kwargs['cols']
        cols.append('time')
        df = df[cols]

    if ('select' in kwargs):
        select = kwargs['select']
        df = select_df(df, select[0], select[1])

    plt.style.use('seaborn-v0_8-deep')

    colors = ['#274553', '#E77250',
              '#CB3734', '#DE8220', '#6D468E', '#A06039', '#000000', '#408B85', 'yellow', 'red']

    # create a figure and axis object
    if ('figsize' in kwargs):
        fig, ax = plt.subplots(figsize=kwargs['figsize'])
    else:
        fig, ax = plt.subplots(figsize=(10, 8))

    # set the x-axis to the time column
    x = df['time']
    ax.set_xlabel('Time', fontsize=12)

    # plot each column as a line chart
    color_i = 0
    for col in df.columns:
        if col != 'time' and col != '#frame' and col != 'hipx':
            y = df[col]
            ax.plot(x, y, label=col, linestyle='-',
                    linewidth=2, color=colors[color_i], alpha=0.8)
            color_i += 1

    # set the y-axis label and legend
    ax.set_ylabel('Values', fontsize=12)
    # ax.legend(loc='upper left', fontsize=10)

    # add grid lines
    ax.grid(True)

    # set the font size of the tick labels
    ax.tick_params(axis='both', which='major', labelsize=10)

    if ('touch_downs' in kwargs):
        touch_downs = kwargs['touch_downs']
        # add vertical lines for touch-down and toe-off

        for i in range(len(touch_downs)):
            if (i % 2 == 0):
                ax.axvline(x=touch_downs[i], linestyle='--', color='#0A9047')

            else:
                ax.axvline(x=touch_downs[i] + 0.015,
                           linestyle='--', color='#0A9047')

    if ('toe_offs' in kwargs):
        toe_offs = kwargs['toe_offs']
        for i in range(len(toe_offs)):
            if (i % 2 == 0):
                ax.axvline(x=toe_offs[i], linestyle='--', color='#6495ED')

            else:
                ax.axvline(x=toe_offs[i], linestyle='--', color='#6495ED')

    # create box legends
    legends = [col for col in df.columns if col !=
               'time' and col != 'hipx' and col != '#frame']

    boxes = []
    for i in range(len(legends)):
        box = Rectangle((0, 0), 1, 1, color=colors[i], alpha=1)
        boxes.append(box)

    if ('touch_downs' in kwargs):
        box = Rectangle((0, 0), 1, 1, color='#0A9047', alpha=1)
        boxes.append(box)
        legends.append('Touch Down')

    if ('toe_offs' in kwargs):
        box = Rectangle((0, 0), 1, 1, color='#6495ED', alpha=1)
        boxes.append(box)
        legends.append('Toe Off')

    # add the box legends to the plot
    ax.legend(boxes, legends, loc='upper center',
              bbox_to_anchor=(0.5, -0.15), ncol=3, fontsize=10)

    # legend = ax.legend(loc='upper center', bbox_to_anchor=(
    #     0.5, -0.15), ncol=3, fontsize=10)

    # adjust the figure margins
    fig.tight_layout(pad=2)

    # display the plot
    plt.show()

    return