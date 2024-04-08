from fuzzywuzzy import fuzz
import math
import pandas as pd
import numpy as np
from scipy.signal import argrelextrema
import matplotlib.pyplot as plt
from matplotlib.patches import Rectangle
import os
import plotly.graph_objects as go

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
            df_jnt['trunk'] = (angles_rt + angles_lt) / 2

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


def plot(data_type='jnt', **kwargs):

    if('df' in kwargs):
        df = kwargs['df']
    else:
        df = pd.read_csv('%s/%s/%s_%s_%s.csv' % (kwargs['file_location'], kwargs['subject'], kwargs['subject'], kwargs['trial'], data_type))
    
    if(kwargs['steps'] == 'Y'):
        df_step = pd.read_csv('%s/%s/%sstep.csv' % (kwargs['file_location'], kwargs['subject'], kwargs['subject']))
        tdowns = df_step[df_step['trial'] == kwargs['trial']][['touch down', 'touch down.1', 'touch down.2', 'touch down.3']].values.tolist()[0]
        toffs = df_step[df_step['trial'] == kwargs['trial']][['toe off', 'toe off.1', 'toe off.2', 'toe off.3']].values.tolist()[0]
    
    if(data_type=='grf'):
        cols = ['AP', 'ML', 'VT']
    else:
        cols = ['foot', 'shank', 'thigh', 'trunk']
        if(kwargs['hip'] == 'Y'): cols.append('hipx')

    jnt_col = ['trunk']
    if(kwargs['hip'] == 'Y'): jnt_col.append('hipx')
    
    traces = []
    colors = ['#1b9e77', '#d95f02', '#7570b3', '#e7298a', '#66a61e', '#e6ab02', '#a6761d', '#666666']
    i = 0
    for col in cols:
        if(col in jnt_col):
            x_values = df['time'].to_list()
            y_values = df['%s'%(col)].to_list()

            trace = go.Scatter(
                x=x_values,
                y=y_values,
                mode='lines',
                name='%s'%(col),
                text=x_values,  
                hoverinfo='x',  
                line=dict(width=2, color=colors[i]),  
            )
            i += 1

            traces.append(trace)
            
        else:
            x_values = df['time'].to_list()
            x_values = [float(x) for x in x_values]
            y_values1 = df['L-%s'%(col) if(data_type == 'grf') else 'L%s'%(col)].to_list()
            y_values2 = df['R-%s' % (col) if(data_type == 'grf') else 'R%s'%(col)].to_list()

            trace1 = go.Scatter(
                x=x_values,
                y=y_values1,
                mode='lines',
                name='L-%s'%(col),
                text=x_values,  
                hoverinfo='x',  
                line=dict(width=2, color=colors[i]),  
            )
            i += 1

            trace2 = go.Scatter(
                x=x_values,
                y=y_values2,
                mode='lines',  
                name='R-%s'%(col),  
                hoverinfo='x',  
                line=dict(width=2, color=colors[i], dash='dash'),  
            )
            i += 1

            traces.append(trace1)
            traces.append(trace2)

    layout = go.Layout(
        xaxis=dict(
            title='time (s)',
            # tickformat='.2f',
            # nticks=5, 
        ),

        yaxis=dict(title='force (N)' if(data_type == 'grf') else 'angle (deg)'),
    )

    fig = go.Figure(data=traces, layout=layout)

    if(kwargs['steps'] == 'Y'):
        numeric_df = df.select_dtypes(include=['number']).drop('time', axis=1, errors='ignore')
        min_value = numeric_df.min().min()
        max_value = numeric_df.max().max()

        for i, tdown in enumerate(tdowns):
            y_range = [min_value, max_value]
            fig.add_trace(go.Scatter(
                x=[tdown, tdown],
                y=[y_range[0], y_range[1]],  # Use the determined or default y-range
                mode="lines",
                name='tdown',
                legendgroup='tdown',
                line=dict(color='RoyalBlue', width=2, dash='longdashdot'),
                hoverinfo='x',
                showlegend=(i==0)
            ))

        for i, toff in enumerate(toffs):
            y_range = [min_value, max_value]
            fig.add_trace(go.Scatter(
                x=[toff, toff],
                y=[y_range[0], y_range[1]],  # Use the determined or default y-range
                mode="lines",
                name='toff',
                legendgroup='toff',
                line=dict(color='rebeccapurple', width=2, dash='longdashdot'),
                hoverinfo='x',
                showlegend=(i==0)
            ))

    fig.show()

    return