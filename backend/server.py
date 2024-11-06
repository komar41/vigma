from flask import Flask, jsonify, request, Response, send_file, render_template, send_from_directory
from flask_cors import CORS
import pandas as pd
import numpy as np
import os
from scipy.interpolate import interp1d
from scipy.signal import argrelextrema
from sklearn.impute import KNNImputer
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

    def knn_impute(data_type = 'jnt', **kwargs):
        df = kwargs['dataframe']
        df.columns = df.columns.str.strip()

        if('' in df.columns):
            df = df.drop(columns=[''])

        columns = ['time', '#frame']
        existing_columns_to_drop = [col for col in columns if col in df.columns]

        df_knn = df.drop(columns=existing_columns_to_drop)

        knn_imputer = KNNImputer(n_neighbors=5, weights='uniform')

        df_knn_imputed = pd.DataFrame(
            knn_imputer.fit_transform(df_knn), columns=df_knn.columns)

        for col in columns:
            if col in df.columns:
                df_knn_imputed[col] = df[col]

        return df_knn_imputed
    
    jnts = pd.read_csv(filepath + "_jnt.csv")
    jnts = knn_impute(dataframe = jnts, data_type='jnt')
    # grfs = pd.read_csv(filepath + "_grf.csv")

    parent_dir = os.path.abspath(os.path.join(filepath, "../../"))
    demographic_file_path = os.path.join(parent_dir, "demographic.csv")
    dem = pd.read_csv(demographic_file_path)

    directory = os.path.dirname(filepath)
    sts = pd.read_csv(directory + "/" + sid + "step.csv")

    jnts.columns = jnts.columns.str.strip()
    # grfs.columns = grfs.columns.str.strip()
    dem.columns = dem.columns.str.strip()

    thigh = dem[dem['id'] == sid]['thigh'].values[0]
    shank = dem[dem['id'] == sid]['shank'].values[0]


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

@app.route('/process_form_data', methods=['POST'])
def process_form_data():
    if request.method == 'POST':        
        form_data = request.json
        fileLocation =  form_data.get('fileLocation')     #form_data.get('fileLocation') # C:/Users/qshah/Documents/Spring 2024/eMoGis/data-processed
        if(fileLocation[-1] != '/'): fileLocation += '/'
        group1Files = form_data.get('group1SelectedFiles') # [stroke_patients/011918ds_20,stroke_patients/012518cm_23,stroke_patients/081017bf_20]
        group2Files = form_data.get('group2SelectedFiles') # [healthy_controls/081517ap_8,healthy_controls/090717jg_42,healthy_controls/101217al_29]
        col = form_data.get('selectedColumn') # AP/ML/VT/hipx/trunk/foot/shank/thigh/STP
        footing1 = form_data.get('selectedFooting1') # L/R/Agg/NA
        cycle1 = form_data.get('selectedCycle1') # L/R/NA
        footing2 = form_data.get('selectedFooting2') # L/R/Agg/NA
        cycle2 = form_data.get('selectedCycle2') # L/R/NA

        group1Files_loc = [fileLocation + file.split('/')[0] + '/' + file.split('/')[1].split('_')[0] + '/' + file.split('/')[1] for file in group1Files]
        group2Files_loc = [fileLocation + file.split('/')[0] + '/' + file.split('/')[1].split('_')[0] + '/' + file.split('/')[1] for file in group2Files]

        # print(group2Files, group1Files)
        df_1, df_2, df_1_mnmx, df_2_mnmx = None, None, None, None
        dict_list_df1, dict_list_df2 = None, None

        if(col=='STP'):
            df_1 = get_stp_params(group1Files_loc)
            if group2Files: df_2 = get_stp_params(group2Files_loc)

        else:
            col_1 = get_col(col, footing1)
            col_2 = get_col(col, footing2)
            
            if(col == 'AP' or col == 'ML' or col == 'VT'): type = 'grf'
            else: type = 'jnt'

            # create another dictionary to store patient group for each file. For instance, stroke_patients/011918ds_20 will be 011918ds_20: stroke_patients
            dict_group1 = {file.split('/')[1].split('_')[0] + "_" + file.split('/')[1].split('_')[1]: file.split('/')[0] for file in group1Files}
            dict_group2 = {file.split('/')[1].split('_')[0] + "_" + file.split('/')[1].split('_')[1]: file.split('/')[0] for file in group2Files}

            group1FilesLoc = [file + '_%s.csv'%type for file in group1Files_loc]
            group2FilesLoc = [file + '_%s.csv'%type for file in group2Files_loc]

            dict_df_1, df_1 = process_data(fileLocation, group1FilesLoc, col_1, footing1, cycle1)
            df_1.columns = ['time'] + [col[-1] for col in df_1.columns if col != 'time']
            dict_list_df1 = {key: df.to_dict(orient='records') for key, df in dict_df_1.items()}
            # add g1 to keys of dict_list_df1 so that keys will be like key_g1
            # dict_list_df1 = {key + '_g1': value for key, value in dict_list_df1.items()}

            if(group2Files):
                dict_df_2, df_2 = process_data(fileLocation, group2FilesLoc, col_2, footing2, cycle2)
                df_2.columns = ['time'] + [col[-1] for col in df_2.columns if col != 'time']
                dict_list_df2 = {key: df.to_dict(orient='records') for key, df in dict_df_2.items()}
                # dict_list_df2 = {key + '_g2': value for key, value in dict_list_df2.items()}

        # print(dict_group1)
        response = {
            'df1': df_1.to_dict(orient='records'),
            'df1_data': dict_list_df1,
            'df1_mnmx': df_1_mnmx
        }

        if(col != 'STP'):
            response.update({
                'df1_patient_group': dict_group1
            })

        if group2Files:
            response.update({
                'df2': df_2.to_dict(orient='records'),
                'df2_data': dict_list_df2,
                'df2_mnmx': df_2_mnmx
            })
            if(col != 'STP'):
                response.update({
                    'df2_patient_group': dict_group2,
                })

        return jsonify(response)
    
# df: time, l, m, u
# df: sid, trial, RstepLength, LstepLength, timeRswing, timeLswing, timeRgait, timeLgait, GaitSpeed


@app.route('/get_start_end_time', methods=['POST'])
def get_start_end_time():
    # Get data from the request
    data = request.json
    fileLocation = data['fileLocation']
    patient_group = data['patient_group']
    patient_id = data['patient_id']
    trial = data['trial']
    footing = data['footing']
    cycle = data['cycle']
    
    # Logic to compute start and end time
    data_step = pd.read_csv(f"{fileLocation}/{patient_group}/{patient_id}/{patient_id}step.csv")
    data_step = data_step[(data_step['trial'] == int(trial)) & (data_step['subject'] == patient_id)]
    
    if data_step['footing'].values[0] == 'L':
        if cycle == 'L':
            start_time = data_step['touch down'].values[0]
            end_time = data_step['touch down.2'].values[0]
        else:
            start_time = data_step['touch down.1'].values[0]
            end_time = data_step['touch down.3'].values[0]
    else:
        if cycle == 'L':
            start_time = data_step['touch down.1'].values[0]
            end_time = data_step['touch down.3'].values[0]
        else:
            start_time = data_step['touch down'].values[0]
            end_time = data_step['touch down.2'].values[0]
    
    # Return start and end time as JSON response
    return jsonify({'start_time': start_time, 'end_time': end_time})

# Define the base directory where all your data (videos and other files) are located
DATA_DIRECTORY = os.path.join(os.getcwd(), 'data')

# Route to serve files from the data directory and its subdirectories
@app.route('/data/<path:filepath>')
def serve_data(filepath):
    # Serve the requested file from the data directory
    return send_from_directory(DATA_DIRECTORY, filepath)


if __name__ == "__main__":
    app.run(host='0.0.0.0', port=5000)
