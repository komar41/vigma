from flask import Flask, jsonify, request, Response, send_file, render_template
from flask_cors import CORS
import pandas as pd
import numpy as np
import os
from scipy.interpolate import interp1d
from scipy.signal import argrelextrema
import pandas as pd

app = Flask(__name__)
CORS(app)

def extract_stp(filepath, sid, trial):
    jnts = pd.read_csv(filepath + "_jnt.csv")
    grfs = pd.read_csv(filepath + "_grf.csv")

    directory = os.path.dirname(filepath)
    sts = pd.read_csv(directory + "/" + sid + "step.csv")
    
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

def get_stp_params(file_location):
    stpParams = []
    for file in file_location:
        sid = file.split('/')[-1].split('_')[0]
        trial = int(file.split('/')[-1].split('_')[1])
        RstepLength, LstepLength, timeRswing, timeLswing, timeRgait, timeLgait, GaitSpeed = extract_stp(file, sid, trial)
        stpParams.append([sid, trial, RstepLength, LstepLength, timeRswing, timeLswing, timeRgait, timeLgait, GaitSpeed])

    return pd.DataFrame(stpParams, columns=['sid', 'trial', 'RstepLength', 'LstepLength', 'timeRswing', 'timeLswing', 'timeRgait', 'timeLgait', 'GaitSpeed'])

def interpolate_data(df, min_points):
    indices = np.arange(len(df))
    interpolated_data = pd.DataFrame()

    cols = df.columns.tolist()

    for col in cols:
        if(col != 'time'):
            interpolation_function = interp1d(indices, df[col], kind='linear')
            interpolated_indices = np.linspace(0, len(df) - 1, min_points)
            interpolated_data[col] = interpolation_function(interpolated_indices)

    t = np.linspace(0, 100, len(interpolated_data))
    interpolated_data['time'] = t

    cols = interpolated_data.columns.tolist()
    cols = cols[-1:] + cols[:-1]
    interpolated_data = interpolated_data[cols]
    
    return interpolated_data

def get_normalized_data(file_location, data_files, col):

    def normalize_data(file_location, data_files, col):
        min_points = 100
        array_L_cycle, array_R_cycle = [], []

        for file in data_files:
            patient_id = file.split('/')[-1].split('_')[0]
            trial_num = file.split('/')[-1].split('_')[1]
            folder = file.split('/')[-3]

            folder_location = file_location + '/' + folder
            data = pd.read_csv(file)
            data = data[['time', col]]
            
            data_step = pd.read_csv("%s/%s/%sstep.csv" % (folder_location,patient_id, patient_id))
            data_step = data_step[(data_step['trial'] == int(trial_num)) & (data_step['subject'] == patient_id)]
            
            if(data_step['footing'].values[0] == 'L'):
                data_trimmed_L_cycle = data[(data['time'] >= data_step['touch down'].values[0]) & (data['time'] <= data_step['touch down.2'].values[0])]
                data_trimmed_R_cycle = data[(data['time'] >= data_step['touch down.1'].values[0]) & (data['time'] <= data_step['touch down.3'].values[0])]
            else:
                data_trimmed_L_cycle = data[(data['time'] >= data_step['touch down.1'].values[0]) & (data['time'] <= data_step['touch down.3'].values[0])]
                data_trimmed_R_cycle = data[(data['time'] >= data_step['touch down'].values[0]) & (data['time'] <= data_step['touch down.2'].values[0])]
            
            interpolated_data_L_cycle = interpolate_data(data_trimmed_L_cycle, min_points)
            interpolated_data_R_cycle = interpolate_data(data_trimmed_R_cycle, min_points)

            array_L_cycle.append(interpolated_data_L_cycle)
            array_R_cycle.append(interpolated_data_R_cycle)

        return array_L_cycle, array_R_cycle
    
    if(col=='AP' or col=='ML' or col=='VT' or col=='foot' or col=='shank' or col=='thigh'):
        if(col=='AP' or col=='ML' or col=='VT'): grf = True
        else: grf = False
        array_L_Lcycle, array_L_Rcycle = normalize_data(file_location, data_files, 'L-%s'%col if grf else 'L%s'%col)
        array_R_Lcycle, array_R_Rcycle = normalize_data(file_location, data_files, 'R-%s'%col if grf else 'R%s'%col)

        if(col=='AP' or col=='ML' or col=='VT'):
            array_agg_Lcycle, array_agg_Rcycle = [], []

            for i in range(len(array_L_Lcycle)):
                array_L_Lcycle_values = array_L_Lcycle[i]['L-%s'%col if grf else 'L%s'%col].values
                array_R_Lcycle_values = array_R_Lcycle[i]['R-%s'%col if grf else 'R%s'%col].values

                df = pd.DataFrame()
                df['time'] = array_L_Lcycle[i]['time'].values
                df['%s'%col] = [x + y for x, y in zip(array_L_Lcycle_values, array_R_Lcycle_values)]
                df = interpolate_data(df, 100)

                array_agg_Lcycle.append(df)

                array_L_Rcycle_values = array_L_Rcycle[i]['L-%s'%col if grf else 'L%s'%col].values
                array_R_Rcycle_values = array_R_Rcycle[i]['R-%s'%col if grf else 'R%s'%col].values

                df = pd.DataFrame()
                df['time'] = array_L_Rcycle[i]['time'].values
                df['%s'%col] = [x + y for x, y in zip(array_L_Rcycle_values, array_R_Rcycle_values)]
                df = interpolate_data(df, 100)

                array_agg_Rcycle.append(df)

            return array_L_Lcycle, array_L_Rcycle, array_R_Lcycle, array_R_Rcycle, array_agg_Lcycle, array_agg_Rcycle
        
        else:
            return array_L_Lcycle, array_L_Rcycle, array_R_Lcycle, array_R_Rcycle
        
    else:
        array_Lcycle, array_Rcycle = normalize_data(file_location, data_files, col)
        return array_Lcycle, array_Rcycle

def get_ensembled_data(array_of_df, col):
    
    def mean_sd(data):
        m = np.mean(data)
        sd = np.std(data)
        return m, m-sd, m+sd

    df = pd.DataFrame()
    df['time'] = array_of_df[0]['time']

    for i in range(len(df)):
        values = []
        for df_ in  array_of_df:
            values.append(df_.loc[i, col])

            m, l, u = mean_sd(values)
            df.loc[i, ('%s_m'%col)] = m
            df.loc[i, ('%s_l'%col)] = l
            df.loc[i, ('%s_u'%col)] = u
    
    return df

def process_data(file_location, data_files, col):
    if(col=='AP' or col=='ML' or col=='VT'):
        array_L_Lcycle, array_L_Rcycle, array_R_Lcycle, array_R_Rcycle, array_Lcycle, array_Rcycle = get_normalized_data(file_location, data_files, col)
        df_L_Lcycle, df_L_Rcycle, df_R_Lcycle, df_R_Rcycle, df_agg_Lcycle, df_agg_Rcycle = get_ensembled_data(array_L_Lcycle, 'L-%s'%col), get_ensembled_data(array_L_Rcycle, 'L-%s'%col), get_ensembled_data(array_R_Lcycle, 'R-%s'%col), get_ensembled_data(array_R_Rcycle, 'R-%s'%col), get_ensembled_data(array_Lcycle, '%s'%col), get_ensembled_data(array_Rcycle, '%s'%col)
        return df_L_Lcycle, df_L_Rcycle, df_R_Lcycle, df_R_Rcycle, df_agg_Lcycle, df_agg_Rcycle
    
    elif(col=='foot' or col=='shank' or col=='thigh'):
        array_L_Lcycle, array_L_Rcycle, array_R_Lcycle, array_R_Rcycle = get_normalized_data(file_location, data_files, col)
        df_L_Lcycle, df_L_Rcycle, df_R_Lcycle, df_R_Rcycle = get_ensembled_data(array_L_Lcycle, 'L%s'%col), get_ensembled_data(array_L_Rcycle, 'L%s'%col), get_ensembled_data(array_R_Lcycle, 'R%s'%col), get_ensembled_data(array_R_Rcycle, 'R%s'%col)
        return df_L_Lcycle, df_L_Rcycle, df_R_Lcycle, df_R_Rcycle
    
    else:
        array_L_cycle, array_R_cycle = get_normalized_data(file_location, data_files, col)
        df_Lcycle, df_Rcycle = get_ensembled_data(array_L_cycle, '%s'%col), get_ensembled_data(array_R_cycle, '%s'%col)
        return df_Lcycle, df_Rcycle
    
def get_dfs(col, footing, cycle, **kwargs):

    options = {
        'df_L_Lcycle_1': None, 'df_L_Rcycle_1': None, 'df_R_Lcycle_1': None, 'df_R_Rcycle_1': None, 'df_agg_Lcycle_1': None, 'df_agg_Rcycle_1': None,
        'df_L_Lcycle_2': None, 'df_L_Rcycle_2': None, 'df_R_Lcycle_2': None, 'df_R_Rcycle_2': None, 'df_agg_Lcycle_2': None, 'df_agg_Rcycle_2': None,
        'df_Lcycle_1': None, 'df_Rcycle_1': None, 'df_Lcycle_2': None, 'df_Rcycle_2': None
    }

    options.update(kwargs)

    if(col == 'hipx' or col == 'trunk'):
        if(cycle == 'L'):
            df_1 = options['df_Lcycle_1']
            df_2 = options['df_Lcycle_2']
        else:
            df_1 = options['df_Rcycle_1']
            df_2 = options['df_Rcycle_2']

    else:
        if(footing == 'L'):
            if(cycle == 'L'):
                df_1 = options['df_L_Lcycle_1']
                df_2 = options['df_L_Lcycle_2']
            else:
                df_1 = options['df_L_Rcycle_1']
                df_2 = options['df_L_Rcycle_2']

        elif(footing == 'R'):
            if(cycle == 'L'):
                df_1 = options['df_R_Lcycle_1']
                df_2 = options['df_R_Lcycle_2']
            else:
                df_1 = options['df_R_Rcycle_1']
                df_2 = options['df_R_Rcycle_2']

        elif(footing == 'Agg'):
            if(cycle == 'L'):
                df_1 = options['df_agg_Lcycle_1']
                df_2 = options['df_agg_Lcycle_2']
            else:
                df_1 = options['df_agg_Rcycle_1']
                df_2 = options['df_agg_Rcycle_2']

    return df_1, df_2

# Test cmd line: curl -X POST -H "Content-Type: application/json" -d @payload.json http://127.0.0.1:5000/process_form_data
# stroke_patients/011918ds_20,stroke_patients/012518cm_23,stroke_patients/081017bf_20
# healthy_controls/081517ap_8,healthy_controls/090717jg_42,healthy_controls/101217al_29

@app.route('/process_form_data', methods=['POST']) # Add , 'GET' to check
def process_form_data():
    # if request.method == 'POST':
    form_data = request.json
    fileLocation = form_data.get('fileLocation') # C:/Users/qshah/Documents/Spring 2024/eMoGis/data-processed
    group1Files = form_data.get('group1SelectedFiles') # [stroke_patients/011918ds_20,stroke_patients/012518cm_23,stroke_patients/081017bf_20]
    group2Files = form_data.get('group2SelectedFiles') # [healthy_controls/081517ap_8,healthy_controls/090717jg_42,healthy_controls/101217al_29]
    col = form_data.get('selectedColumn') # AP/ML/VT/hipx/trunk/foot/shank/thigh/STP
    footing = form_data.get('selectedFooting') # L/R/Agg/NA
    cycle = form_data.get('selectedCycle') # L/R/NA

    group1Files_loc = [fileLocation + file.split('/')[0] + '/' + file.split('/')[1].split('_')[0] + '/' + file.split('/')[1] for file in group1Files]
    group2Files_loc = [fileLocation + file.split('/')[0] + '/' + file.split('/')[1].split('_')[0] + '/' + file.split('/')[1] for file in group2Files]

    df_1, df_2 = None, None

    if(col=='STP'):
        df_1 = get_stp_params(group1Files_loc)
        df_2 = get_stp_params(group2Files_loc)

    else:
        if(col=='AP' or col=='ML' or col=='VT'):
            group1FilesLoc = [file + '_grf.csv' for file in group1Files_loc]
            group2FilesLoc = [file + '_grf.csv' for file in group2Files_loc]
            df_L_Lcycle_1, df_L_Rcycle_1, df_R_Lcycle_1, df_R_Rcycle_1, df_agg_Lcycle_1, df_agg_Rcycle_1 = process_data(fileLocation, group1FilesLoc, col)
            df_L_Lcycle_2, df_L_Rcycle_2, df_R_Lcycle_2, df_R_Rcycle_2, df_agg_Lcycle_2, df_agg_Rcycle_2 = process_data(fileLocation, group2FilesLoc, col)
            df_1, df_2 = get_dfs(col, footing, cycle, df_L_Lcycle_1=df_L_Lcycle_1, df_L_Rcycle_1=df_L_Rcycle_1, df_R_Lcycle_1=df_R_Lcycle_1, df_R_Rcycle_1=df_R_Rcycle_1, df_agg_Lcycle_1=df_agg_Lcycle_1, df_agg_Rcycle_1=df_agg_Rcycle_1, df_L_Lcycle_2=df_L_Lcycle_2, df_L_Rcycle_2=df_L_Rcycle_2, df_R_Lcycle_2=df_R_Lcycle_2, df_R_Rcycle_2=df_R_Rcycle_2, df_agg_Lcycle_2=df_agg_Lcycle_2, df_agg_Rcycle_2=df_agg_Rcycle_2)

        elif(col!='hipx' and col!='trunk'):
            group1FilesLoc = [file + '_jnt.csv' for file in group1Files_loc]
            group2FilesLoc = [file + '_jnt.csv' for file in group2Files_loc]
            df_L_Lcycle_1, df_L_Rcycle_1, df_R_Lcycle_1, df_R_Rcycle_1 = process_data(fileLocation, group1FilesLoc, col)
            df_L_Lcycle_2, df_L_Rcycle_2, df_R_Lcycle_2, df_R_Rcycle_2 = process_data(fileLocation, group2FilesLoc, col)
            df_1, df_2 = get_dfs(col, footing, cycle, df_L_Lcycle_1=df_L_Lcycle_1, df_L_Rcycle_1=df_L_Rcycle_1, df_R_Lcycle_1=df_R_Lcycle_1, df_R_Rcycle_1=df_R_Rcycle_1, df_L_Lcycle_2=df_L_Lcycle_2, df_L_Rcycle_2=df_L_Rcycle_2, df_R_Lcycle_2=df_R_Lcycle_2, df_R_Rcycle_2=df_R_Rcycle_2)

        else:
            group1FilesLoc = [file + '_jnt.csv' for file in group1Files_loc]
            group2FilesLoc = [file + '_jnt.csv' for file in group2Files_loc]
            df_Lcycle_1, df_Rcycle_1 = process_data(fileLocation, group1FilesLoc, col)
            df_Lcycle_2, df_Rcycle_2 = process_data(fileLocation, group2FilesLoc, col)
            df_1, df_2 = get_dfs(col, footing, cycle, df_Lcycle_1=df_Lcycle_1, df_Rcycle_1=df_Rcycle_1, df_Lcycle_2=df_Lcycle_2, df_Rcycle_2=df_Rcycle_2)

        df_1.columns = ['time'] + [col[-1] for col in df_1.columns if col != 'time']
        df_2.columns = ['time'] + [col[-1] for col in df_2.columns if col != 'time']

        # Add Local, global minima and maxima to the charts
        l_minima_1 = argrelextrema(df_1['m'].values, np.less)[0].tolist()
        l_maxima_1 = argrelextrema(df_1['m'].values, np.greater)[0].tolist()
        l_minima_2 = argrelextrema(df_2['m'].values, np.less)[0].tolist()
        l_maxima_2 = argrelextrema(df_2['m'].values, np.greater)[0].tolist()

        g_minima_1 = df_1['m'].idxmin()
        g_maxima_1 = df_1['m'].idxmax()
        g_minima_2 = df_2['m'].idxmin()
        g_maxima_2 = df_2['m'].idxmax()

        df_1_mnmx = {'l_minima': l_minima_1, 'l_maxima': l_maxima_1, 'g_minima': g_minima_1, 'g_maxima': g_maxima_1}
        df_2_mnmx = {'l_minima': l_minima_2, 'l_maxima': l_maxima_2, 'g_minima': g_minima_2, 'g_maxima': g_maxima_2}

        # Option to save normalized CSV files in frontend

    return jsonify({'df1': df_1.to_dict(orient='records'), 'df2': df_2.to_dict(orient='records'), 'df1_mnmx': df_1_mnmx, 'df2_mnmx': df_2_mnmx})
    
    # else: 
    #     return render_template('index.html')

if __name__ == '__main__':
    app.run(debug=True)
