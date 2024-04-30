from flask import Flask, jsonify, request, Response, send_file, render_template
from flask_cors import CORS
import pandas as pd
import numpy as np
import os
from scipy.interpolate import interp1d
from scipy.signal import argrelextrema
import pandas as pd
import json

app = Flask(__name__)
CORS(app)

@app.route('/send-data', methods=['POST'])
def receive_data():
    # Get folder location from the frontend

    data = request.json
    folder_location =   data.get('fileLocation')        # data.get('fileLocation')
    
    if folder_location and os.path.exists(folder_location):
        # List all files inside the folder and its subfolders
        file_list = []

        folder_files = {}
                # Iterate through the folders
        for entry in os.listdir(folder_location):
            # print("Entry:", entry)
            full_path = os.path.join(folder_location, entry)
            if os.path.isdir(full_path):
                # print("Full Path:", full_path)
                folder_files[entry] = {}
                for sub_entry in os.listdir(full_path):
                    sub_full_path = os.path.join(full_path, sub_entry)
                    if os.path.isdir(sub_full_path):
                        folder_files[entry][sub_entry] = []  # Initialize the list for this subfolder
                        for file in os.listdir(sub_full_path):
                            if file.startswith(sub_entry):  # Check if file name starts with subfolder name
                                file_path = os.path.join(sub_full_path, file)
                                if os.path.isfile(file_path):  # Make sure it's a file
                                    # Add the file name to the list corresponding to this subfolder
                                    folder_files[entry][sub_entry].append(file)

        # Convert the dictionary to JSON format
        json_output = json.dumps(folder_files, indent=4)
        # print("JSON Output",json_output)

        # Return the list of files as JSON
        return json_output
    else:
        # Return an empty JSON array if folder doesn't exist
        print("Folder doesn't exist")
        return jsonify([])


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

def get_normalized_data(file_location, data_files, col, limb, cycle):

    def normalize_data(file_location, data_files, col, cycle):
        min_points = 100
        dict_ = {}

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
                if(cycle == 'L'): data_trimmed = data[(data['time'] >= data_step['touch down'].values[0]) & (data['time'] <= data_step['touch down.2'].values[0])]
                else: data_trimmed = data[(data['time'] >= data_step['touch down.1'].values[0]) & (data['time'] <= data_step['touch down.3'].values[0])]
            else:
                if(cycle == 'L'): data_trimmed = data[(data['time'] >= data_step['touch down.1'].values[0]) & (data['time'] <= data_step['touch down.3'].values[0])]
                else: data_trimmed = data[(data['time'] >= data_step['touch down'].values[0]) & (data['time'] <= data_step['touch down.2'].values[0])]
            
            interpolated_data = interpolate_data(data_trimmed, min_points)
            dict_[patient_id + '_' + trial_num] = interpolated_data

        return dict_
    
    if(col=='AP' or col=='ML' or col=='VT' or col=='foot' or col=='shank' or col=='thigh'):
        if(col=='AP' or col=='ML' or col=='VT'): grf = True
        else: grf = False
        
        dict_L = normalize_data(file_location, data_files, 'L-%s'%col if grf else 'L%s'%col, cycle)
        dict_R = normalize_data(file_location, data_files, 'R-%s'%col if grf else 'R%s'%col, cycle)

        if(limb == 'Agg'):
            dict_agg = {}

            for key in dict_L.keys():
                dict_L_values = dict_L[key]['L-%s'%col if grf else 'L%s'%col].values
                dict_R_values = dict_R[key]['R-%s'%col if grf else 'R%s'%col].values

                df = pd.DataFrame()
                df['time'] = dict_L[key]['time'].values
                df['%s'%col] = [x + y for x, y in zip(dict_L_values, dict_R_values)]
                df = interpolate_data(df, 100)

                dict_agg[key] = df

            return dict_agg
        
        elif(limb == 'L'):
            return dict_L
        else:
            return dict_R
        
    else:
        dict_ = normalize_data(file_location, data_files, col, cycle)
        return dict_

def get_ensembled_data(dict_of_df, col):
    
    def mean_sd(data):
        m = np.mean(data)
        sd = np.std(data)
        return m, m-sd, m+sd

    df = pd.DataFrame()
    df['time'] = dict_of_df[list(dict_of_df.keys())[0]]['time'].values

    for i in range(len(df)): 
        values = []
        for key in dict_of_df.keys():
            values.append(dict_of_df[key].loc[i, col])

            m, l, u = mean_sd(values)
            df.loc[i, ('%s_m'%col)] = m
            df.loc[i, ('%s_l'%col)] = l
            df.loc[i, ('%s_u'%col)] = u
    
    return df

def process_data(file_location, data_files, col, limb, cycle):
    dict_ = get_normalized_data(file_location, data_files, col, limb, cycle)
    df = get_ensembled_data(dict_, col)

    for key in dict_.keys():
        dict_[key] = dict_[key].rename(columns={col: 'col'})
    
    return dict_, df

def get_col(col, limb):
    if limb == 'Agg':
        col_ = col
    elif col=='AP' or col=='ML' or col=='VT':
        col_ = limb + '-' + col
    elif col == 'foot' or col == 'shank' or col == 'thigh':
        col_ = limb + col
    else:
        col_ = col
    
    return col_

# Test cmd line: curl -X POST -H "Content-Type: application/json" -d @payload.json http://127.0.0.1:5000/process_form_data
# stroke_patients/011918ds_20,stroke_patients/012518cm_23,stroke_patients/081017bf_20
# healthy_controls/081517ap_8,healthy_controls/090717jg_42,healthy_controls/101217al_29

@app.route('/process_form_data', methods=['POST']) # Add , 'GET' to check
def process_form_data():
    if request.method == 'POST':
        # print(request)
        
        form_data = request.json
        # print("form data",form_data)
        fileLocation =  form_data.get('fileLocation')     #form_data.get('fileLocation') # C:/Users/qshah/Documents/Spring 2024/eMoGis/data-processed
        group1Files = form_data.get('group1SelectedFiles') # [stroke_patients/011918ds_20,stroke_patients/012518cm_23,stroke_patients/081017bf_20]
        group2Files = form_data.get('group2SelectedFiles') # [healthy_controls/081517ap_8,healthy_controls/090717jg_42,healthy_controls/101217al_29]
        col = form_data.get('selectedColumn') # AP/ML/VT/hipx/trunk/foot/shank/thigh/STP
        footing1 = form_data.get('selectedFooting1') # L/R/Agg/NA
        cycle1 = form_data.get('selectedCycle1') # L/R/NA
        footing2 = form_data.get('selectedFooting2') # L/R/Agg/NA
        cycle2 = form_data.get('selectedCycle2') # L/R/NA

        group1Files_loc = [fileLocation + file.split('/')[0] + '/' + file.split('/')[1].split('_')[0] + '/' + file.split('/')[1] for file in group1Files]
        group2Files_loc = [fileLocation + file.split('/')[0] + '/' + file.split('/')[1].split('_')[0] + '/' + file.split('/')[1] for file in group2Files]

        df_1, df_2, df_1_mnmx, df_2_mnmx = None, None, None, None
        dict_list_df1, dict_list_df2 = None, None

        if(col=='STP'):
            df_1 = get_stp_params(group1Files_loc)
            df_2 = get_stp_params(group2Files_loc)

        else:
            col_1 = get_col(col, footing1)
            col_2 = get_col(col, footing2)
            
            if(col == 'AP' or col == 'ML' or col == 'VT'): type = 'grf'
            else: type = 'jnt'
            group1FilesLoc = [file + '_%s.csv'%type for file in group1Files_loc]
            group2FilesLoc = [file + '_%s.csv'%type for file in group2Files_loc]

            dict_df_1, df_1 = process_data(fileLocation, group1FilesLoc, col_1, footing1, cycle1)
            dict_df_2, df_2 = process_data(fileLocation, group2FilesLoc, col_2, footing2, cycle2)

            df_1.columns = ['time'] + [col[-1] for col in df_1.columns if col != 'time']
            df_2.columns = ['time'] + [col[-1] for col in df_2.columns if col != 'time']

            # Add Local, global minima and maxima to the charts
            # l_minima_1 = argrelextrema(df_1['m'].values, np.less)[0].tolist()
            # l_maxima_1 = argrelextrema(df_1['m'].values, np.greater)[0].tolist()
            # l_minima_2 = argrelextrema(df_2['m'].values, np.less)[0].tolist()
            # l_maxima_2 = argrelextrema(df_2['m'].values, np.greater)[0].tolist()

            # g_minima_1 = df_1['m'].idxmin()
            # g_maxima_1 = df_1['m'].idxmax()
            # g_minima_2 = df_2['m'].idxmin()
            # g_maxima_2 = df_2['m'].idxmax()

            # df_1_mnmx = {'l_minima': l_minima_1, 'l_maxima': l_maxima_1, 'g_minima': g_minima_1, 'g_maxima': g_maxima_1}
            # df_2_mnmx = {'l_minima': l_minima_2, 'l_maxima': l_maxima_2, 'g_minima': g_minima_2, 'g_maxima': g_maxima_2}

            # Option to save normalized CSV files in frontend

            dict_list_df1 = {key: df.to_dict(orient='records') for key, df in dict_df_1.items()}
            dict_list_df2 = {key: df.to_dict(orient='records') for key, df in dict_df_2.items()}

        return jsonify({'df1': df_1.to_dict(orient='records'), 'df2': df_2.to_dict(orient='records'), 'df1_data': dict_list_df1, 'df2_data': dict_list_df2, 'df1_mnmx': df_1_mnmx, 'df2_mnmx': df_2_mnmx})
        
        #return jsonify({'df1': 'df_1', 'df2': 'df_2', 'df1_mnmx': 'df_1_mnmx', 'df2_mnmx': 'df_2_mnmx'})
    # else: 
    #     return render_template('index.html')

# df: time, l, m, u
# df: sid, trial, RstepLength, LstepLength, timeRswing, timeLswing, timeRgait, timeLgait, GaitSpeed

if __name__ == "__main__":
    app.run(host='0.0.0.0', port=5000)
