import pandas as pd
import os
import plotly.graph_objects as go
import shutil

def remove_empty_columns(df):
    df = df.loc[:, ~df.columns.str.contains(
        '^Unnamed')]  # remove empty named columns

    df = df.drop(
        columns=[col for col in df.columns if col.isspace()])  # remove empty string named columns

    return df

def save(df, file_dir, patient_id, trial = None, data_type = 'jnt', norm = False, cycle = 'L', replace = False):

    if(norm == True):
        save_path = '%s/%s/%s_%s_%s_cyc_%s' % (file_dir, patient_id, patient_id, trial, data_type, cycle)
        relative_path = '%s_%s_%s_cyc_%s' % (patient_id, trial, data_type, cycle)
        
    elif(data_type == 'sptmp_params'):
        save_path = '%s/%s/%s_sptmp' % (file_dir, patient_id, patient_id)
        relative_path = '%s_sptmp' % (patient_id)

    elif(data_type == 'step_time'):
        save_path = '%s/%s/%sstep' % (file_dir, patient_id, patient_id)
        relative_path = '%sstep' % (patient_id)

    else:
        save_path = '%s/%s/%s_%s_%s' % (file_dir, patient_id, patient_id, trial, data_type)
        relative_path = '%s_%s_%s' % (patient_id, trial, data_type)

    if(replace or not os.path.exists(save_path+'.csv')):
        df.to_csv(save_path+'.csv', index=False)
        print('File saved as %s.csv' % (relative_path), '\n')

    else:
        i = 1
        while os.path.exists(save_path + '(' + str(i) + ')' + '.csv'):
            i += 1
        df.to_csv(save_path + '(' + str(i) + ')'  + '.csv', index=False)
        print('File saved as %s(%s).csv' % (relative_path, i), '\n')
    
    return

def read(file_dir, patient_id, trial = None, data_type = 'jnt', norm = False, cycle = 'L', i = None):
    # jnt/grf/motion/stp_params/step_file/normalized_jnt or grf
    
    if(data_type == 'motion'): path = '%s/%s/%s_%s' % (file_dir, patient_id, patient_id, trial)
    elif(data_type == 'sptmp_params'): path = '%s/%s/%s_sptmp' % (file_dir, patient_id, patient_id)
    elif(data_type == 'step_time'): path = '%s/%s/%sstep' % (file_dir, patient_id, patient_id)
    elif(norm == True): path = '%s/%s/%s_%s_%s_cyc_%s' % (file_dir, patient_id, patient_id, trial, data_type, cycle)
    else: path = '%s/%s/%s_%s_%s' % (file_dir, patient_id, patient_id, trial, data_type)

    if i is not None:
        path = path + '(' + str(i) + ')'
    
    path = path + '.csv'
    
    if(data_type == 'motion'):
        df = pd.read_csv(path, header=None)

        columns = df.iloc[:2]
        df = df.iloc[2:]
        columns = columns.fillna('')

        columns = pd.MultiIndex.from_arrays(columns.values.tolist())
        df.columns = columns

    else:
        df = pd.read_csv(path)
        df = remove_empty_columns(df)

    return df

def plot(df, data_type='jnt', steps = False, cycle=False, **kwargs):

    if(cycle == True):
        steps = False

    if(steps == True):
        df_step = kwargs['step_data']
        first_step = df_step[df_step['trial'] == kwargs['trial']].footing.values[0]
        tdowns1 = df_step[df_step['trial'] == kwargs['trial']][['touch down', 'touch down.2']].values.tolist()[0]
        tdowns2 = df_step[df_step['trial'] == kwargs['trial']][['touch down.1', 'touch down.3']].values.tolist()[0]
        toffs1 = df_step[df_step['trial'] == kwargs['trial']][['toe off', 'toe off.2']].values.tolist()[0]
        toffs2 = df_step[df_step['trial'] == kwargs['trial']][['toe off.1', 'toe off.3']].values.tolist()[0]
        cycle = False
    
    jnt_col = ['trunk', 'hipx']
    if(data_type=='grf'):
        cols = ['AP', 'ML', 'VT']
    else:
        cols = ['foot', 'shank', 'thigh', 'trunk', 'hipx']
    
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
            title='time (s)' if(cycle == False) else 'cycle (%)',
            # tickformat='.2f',
            # nticks=5, 
        ),

        yaxis=dict(title='force (N)' if(data_type == 'grf') else 'angle (deg)'),
    )

    fig = go.Figure(data=traces, layout=layout)

    if(steps == True):
        numeric_df = df.select_dtypes(include=['number']).drop('time', axis=1, errors='ignore')
        min_value = numeric_df.min().min()
        max_value = numeric_df.max().max()

        for i, tdown in enumerate(tdowns1):
            y_range = [min_value, max_value]
            fig.add_trace(go.Scatter(
                x=[tdown, tdown],
                y=[y_range[0], y_range[1]],  # Use the determined or default y-range
                mode="lines",
                name= 'tdowns (L)' if first_step == 'L' else 'tdowns (R)',
                legendgroup='tdown1',
                line=dict(color='RoyalBlue', width=2, dash='longdashdot'),
                hoverinfo='x',
                showlegend=(i==0)
            ))

        for i, tdown in enumerate(tdowns2):
            y_range = [min_value, max_value]
            fig.add_trace(go.Scatter(
                x=[tdown, tdown],
                y=[y_range[0], y_range[1]],  # Use the determined or default y-range
                mode="lines",
                name='tdowns (R)' if first_step == 'L' else 'tdowns (L)',
                legendgroup='tdown2',
                line=dict(color='RoyalBlue', width=2, dash='longdashdot'),
                hoverinfo='x',
                showlegend=(i==0)
            ))

        for i, toff in enumerate(toffs1):
            y_range = [min_value, max_value]
            fig.add_trace(go.Scatter(
                x=[toff, toff],
                y=[y_range[0], y_range[1]],  # Use the determined or default y-range
                mode="lines",
                name='toffs (L)' if first_step == 'L' else 'toffs (R)',
                legendgroup='toff1',
                line=dict(color='rebeccapurple', width=2, dash='longdashdot'),
                hoverinfo='x',
                showlegend=(i==0)
            ))

        for i, toff in enumerate(toffs2):
            y_range = [min_value, max_value]
            fig.add_trace(go.Scatter(
                x=[toff, toff],
                y=[y_range[0], y_range[1]],  # Use the determined or default y-range
                mode="lines",
                name='toffs (R)' if first_step == 'L' else 'toffs (L)',
                legendgroup='toff2',
                line=dict(color='rebeccapurple', width=2, dash='longdashdot'),
                hoverinfo='x',
                showlegend=(i==0)
            ))

    fig.show()

    return

def load_VA(file_location, patient_id, group='misc'):

    print(file_location)

    # for trial in trial_ids:
    #     os.makedirs('../data-processed/%s/%s' % (group, patient_id), exist_ok=True)
    #     shutil.copy('%s/%s/%s_%s_jnt.csv' % (file_location, patient_id, patient_id, trial), '../data-processed/%s/%s/%s_%s_%s.csv' % (group, patient_id, patient_id, trial, 'jnt'))
    #     shutil.copy('%s/%s/%s_%s_grf.csv' % (file_location, patient_id, patient_id, trial), '../data-processed/%s/%s/%s_%s_%s.csv' % (group, patient_id, patient_id, trial, 'grf'))

    # shutil.copy('%s/%s/%sstep.csv' % (file_location, patient_id, patient_id), '../data-processed/%s/%s/%sstep.csv' % (group, patient_id, patient_id))
    # shutil.copy('%s/%s/%sstp.csv' % (file_location, patient_id, patient_id), '../data-processed/%s/%s/%sstp.csv' % (group, patient_id, patient_id))

    return