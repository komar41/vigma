import os
from flask import Flask, jsonify, request, Response, send_file
from flask_cors import CORS
import subprocess
import time
import base64
import pandas as pd
import requests  
import zipfile
import json

app = Flask(__name__)
CORS(app)

# Configuration parameters
#app.config['FOLDER_DIRECTORY'] = 'data/'

import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
from scipy.interpolate import interp1d
from scipy.signal import argrelextrema
import glob
import sys

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
        
        print("data files",data_files)


        for file in data_files:
            #print("files",file)
            # Use os.path.dirname to get the directory name of the filepath
            directory_name = os.path.dirname(file)

            # Use os.path.basename to get the base name (i.e., the last component) of the directory
            desired_name = os.path.basename(directory_name)

            print("desired files",desired_name)
            
            
            patient_id = file.split('\\')[-2]
            #print("split",file.split('\\'))
            trial_num = file.split('/')[-1].split('_')[2]
            #print("trial split",file.split('/')[-1].split('_'))
            #print("trial number",trial_num)
            data = pd.read_csv(file)
            data = data[['time', col]]
            #print("data",data)
            
            #print("data location for step","%s/%s/%sstep.csv" % (file_location,patient_id, patient_id))
            data_step = pd.read_csv("%s/%s/%sstep.csv" % (file_location,patient_id, patient_id))
            
            data_step = data_step[(data_step['trial'] == int(trial_num)) & (data_step['subject'] == patient_id)]
            #print("data step",data_step)
            
            
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
        array_L_Lcycle, array_L_Rcycle = normalize_data(file_location, data_files, 'L_%s'%col if grf else 'L%s'%col)
        #print(array_L_Lcycle, array_L_Rcycle)
        array_R_Lcycle, array_R_Rcycle = normalize_data(file_location, data_files, 'R_%s'%col if grf else 'R%s'%col)

        if(col=='AP' or col=='ML' or col=='VT'):
            array_agg_Lcycle, array_agg_Rcycle = [], []

            for i in range(len(array_L_Lcycle)):
                array_L_Lcycle_values = array_L_Lcycle[i]['L_%s'%col if grf else 'L%s'%col].values
                array_R_Lcycle_values = array_R_Lcycle[i]['R_%s'%col if grf else 'R%s'%col].values

                df = pd.DataFrame()
                df['time'] = array_L_Lcycle[i]['time'].values
                df['%s'%col] = [x + y for x, y in zip(array_L_Lcycle_values, array_R_Lcycle_values)]
                df = interpolate_data(df, 100)

                array_agg_Lcycle.append(df)

                array_L_Rcycle_values = array_L_Rcycle[i]['L_%s'%col if grf else 'L%s'%col].values
                array_R_Rcycle_values = array_R_Rcycle[i]['R_%s'%col if grf else 'R%s'%col].values

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
        df_L_Lcycle, df_L_Rcycle, df_R_Lcycle, df_R_Rcycle, df_agg_Lcycle, df_agg_Rcycle = get_ensembled_data(array_L_Lcycle, 'L_%s'%col), get_ensembled_data(array_L_Rcycle, 'L_%s'%col), get_ensembled_data(array_R_Lcycle, 'R_%s'%col), get_ensembled_data(array_R_Rcycle, 'R_%s'%col), get_ensembled_data(array_Lcycle, '%s'%col), get_ensembled_data(array_Rcycle, '%s'%col)
        return df_L_Lcycle, df_L_Rcycle, df_R_Lcycle, df_R_Rcycle, df_agg_Lcycle, df_agg_Rcycle
    
    elif(col=='foot' or col=='shank' or col=='thigh'):
        array_L_Lcycle, array_L_Rcycle, array_R_Lcycle, array_R_Rcycle = get_normalized_data(file_location, data_files, col)
        #print(array_L_Lcycle, array_L_Rcycle, array_R_Lcycle, array_R_Rcycle)
        df_L_Lcycle, df_L_Rcycle, df_R_Lcycle, df_R_Rcycle = get_ensembled_data(array_L_Lcycle, 'L%s'%col), get_ensembled_data(array_L_Rcycle, 'L%s'%col), get_ensembled_data(array_R_Lcycle, 'R%s'%col), get_ensembled_data(array_R_Rcycle, 'R%s'%col)
        return df_L_Lcycle, df_L_Rcycle, df_R_Lcycle, df_R_Rcycle
    
    else:
        array_L_cycle, array_R_cycle = get_normalized_data(file_location, data_files, col)
        df_Lcycle, df_Rcycle = get_ensembled_data(array_L_cycle, '%s'%col), get_ensembled_data(array_R_cycle, '%s'%col)
        return df_Lcycle, df_Rcycle



def plot_data(col, **kwargs):
    # Set default values for parameters
    options = {
        'df_L1': None, 'df_R1': None, 'df_L2': None, 'df_R2': None, 'df_Agg1': None, 'df_Agg2': None,
        'L1': False, 'L1_fill': False, 'R1': False, 'R1_fill': False,
        'L2': False, 'L2_fill': False, 'R2': False, 'R2_fill': False,
        'Agg1': False, 'Agg1_fill': False, 'Agg2': False, 'Agg2_fill': False,
        'save': False, 'path': None
    }
    options.update(kwargs)

    plt.figure(figsize=(6, 6))
    plt.style.use('seaborn-v0_8')

    plt.xticks(fontsize=18)
    plt.yticks(fontsize=18)

    if (col=='AP' or col=='ML' or col=='VT' or col=='foot' or col=='shank' or col=='thigh'):
        grf = True if col=='AP' or col=='ML' or col=='VT' else False

        if(options['L1']):
            plt.plot(options['df_L1']['time'], options['df_L1']['L_%s_m'%col if grf else 'L%s_m'%col], color='#1b9e77', label='L1')

        if(options['L1_fill']):
            plt.fill_between(options['df_L1']['time'], options['df_L1']['L_%s_l'%col if grf else 'L%s_l'%col], options['df_L1']['L_%s_u'%col if grf else 'L%s_u'%col], color='#1b9e77', alpha=0.2)
        
        if(options['R1']):
            plt.plot(options['df_R1']['time'], options['df_R1']['R_%s_m'%col if grf else 'R%s_m'%col], color='#d95f02', label='R1')

        if(options['R1_fill']):
            plt.fill_between(options['df_R1']['time'], options['df_R1']['R_%s_l'%col if grf else 'R%s_l'%col], options['df_R1']['R_%s_u'%col if grf else 'R%s_u'%col], color='#d95f02', alpha=0.2)

        if(options['L2']):
            plt.plot(options['df_L2']['time'], options['df_L2']['L_%s_m'%col if grf else 'L%s_m'%col], color='#7570b3', label='L2')

        if(options['L2_fill']):
            plt.fill_between(options['df_L2']['time'], options['df_L2']['L_%s_l'%col if grf else 'L%s_l'%col], options['df_L2']['L_%s_u'%col if grf else 'L%s_u'%col], color='#7570b3', alpha=0.2)

        if(options['R2']):
            plt.plot(options['df_R2']['time'], options['df_R2']['R_%s_m'%col if grf else 'R%s_m'%col], color='#e7298a', label='R2')

        if(options['R2_fill']):
            plt.fill_between(options['df_R2']['time'], options['df_R2']['R_%s_l'%col if grf else 'R%s_l'%col], options['df_R2']['R_%s_u'%col if grf else 'R%s_u'%col], color='#e7298a', alpha=0.2)

    if(options['Agg1']):
        plt.plot(options['df_Agg1']['time'], options['df_Agg1']['%s_m'%col], color='#1b9e77', label='LR1')
    
    if(options['Agg1_fill']):
        plt.fill_between(options['df_Agg1']['time'], options['df_Agg1']['%s_l'%col], options['df_Agg1']['%s_u'%col], color='#1b9e77', alpha=0.2)

    if(options['Agg2']):
        plt.plot(options['df_Agg2']['time'], options['df_Agg2']['%s_m'%col], color='#d95f02', label='LR2')

    if(options['Agg2_fill']):
        plt.fill_between(options['df_Agg2']['time'], options['df_Agg2']['%s_l'%col], options['df_Agg2']['%s_u'%col], color='#d95f02', alpha=0.2)

    plt.xlabel('Gait Cycle (%)', fontsize=22)
    if(col=='AP' or col=='ML' or col=='VT'):
        plt.ylabel('Force (N)', fontsize=22)
    else:
        plt.ylabel('Angle (deg)', fontsize=22)

    plt.tight_layout()
    
    if(options['save']):
        plt.savefig(options['path'])
        plt.close()
    else:
        plt.show()

    return


def save_dataframes_as_csv(dataframes_dict, path):
    # Full paths for all files to be returned
    full_file_paths = []
    
    # Iterate through the dictionary
    for filename, df in dataframes_dict.items():
        # Ensure filename ends with .csv
        if not filename.endswith('.csv'):
            filename += '.csv'
        # Create the full file path
        full_file_path = os.path.join(path, filename)
        # Write the DataFrame to a CSV file at the specified path
        df.to_csv(full_file_path, index=False)
        # Add the full file path to the list
        full_file_paths.append(full_file_path)
    
    # Return the list of full paths to the saved CSV files
    return full_file_paths




# Function to process the data and generate images
def generate_images(file_1_location, file_2_location, grp_1_files, grp_2_files, cols):
    # Define the function plot_data() and process_data() or import them from somewhere
    
    cols = ['foot', 'shank', 'thigh', 'trunk', 'hipx']
    # cols = ['AP', 'ML', 'VT']

    paths = []
    root = os.path.dirname(os.getcwd())
    desired_folder = os.path.join(root)
    combined_csv_path = []
    for col in cols:
        if(col=='AP' or col=='ML' or col=='VT'):
            print("Inside IF", col)
            df_L_Lcycle_1, df_L_Rcycle_1, df_R_Lcycle_1, df_R_Rcycle_1, df_agg_Lcycle_1, df_agg_Rcycle_1 = process_data(file_1_location, grp_1_files, col)
            df_L_Lcycle_2, df_L_Rcycle_2, df_R_Lcycle_2, df_R_Rcycle_2, df_agg_Lcycle_2, df_agg_Rcycle_2 = process_data(file_2_location, grp_2_files, col)
            


        elif(col!='hipx' and col!='trunk'):
            print("Inside ELIF", col)
            df_L_Lcycle_1, df_L_Rcycle_1, df_R_Lcycle_1, df_R_Rcycle_1 = process_data(file_1_location, grp_1_files, col)
            df_L_Lcycle_2, df_L_Rcycle_2, df_R_Lcycle_2, df_R_Rcycle_2 = process_data(file_2_location, grp_2_files, col)
            print("2nd time data",col)
            print(df_L_Lcycle_2, df_L_Rcycle_2, df_R_Lcycle_2, df_R_Rcycle_2)
            print("2nd time data End",col)
            combined_csv_path = save_dataframes_as_csv({'df_L_Lcycle_1': df_L_Lcycle_1, 'df_L_Rcycle_1': df_L_Rcycle_1, 'df_R_Lcycle_1': df_R_Lcycle_1,'df_R_Rcycle_1': df_R_Rcycle_1,'df_L_Lcycle_2': df_L_Lcycle_2,'df_L_Rcycle_2': df_L_Rcycle_2,'df_R_Lcycle_2': df_R_Lcycle_2,'df_R_Rcycle_2': df_R_Rcycle_2}, 'D:\Research Assistant\eMoGis\BackendFlask\data\output')
            break

        else:
            print("Inside ELSE", col)
            df_Lcycle_1, df_Rcycle_1 = process_data(file_1_location, grp_1_files, col)
            df_Lcycle_2, df_Rcycle_2 = process_data(file_2_location, grp_2_files, col)


    return combined_csv_path


def create_zip_with_csv(files, zip_name):
    # Create a zip file
    with zipfile.ZipFile(zip_name, 'w') as myzip:
        for file in files:
            # Add each file to the zip file
            myzip.write(file, arcname=os.path.basename(file))
    return zip_name






@app.route('/send-data', methods=['POST'])
def receive_data():
    # Get folder location from the frontend

    data = request.json
    folder_location = data.get('fileLocation')
    
    if folder_location and os.path.exists(folder_location):
        # List all files inside the folder and its subfolders
        file_list = []

        folder_files = {}
                # Iterate through the folders
        for entry in os.listdir(folder_location):
            print("Entry:", entry)
            full_path = os.path.join(folder_location, entry)
            if os.path.isdir(full_path):
                print("Full Path:", full_path)
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
        print("JSON Output",json_output)

        # Return the list of files as JSON
        return json_output
    else:
        # Return an empty JSON array if folder doesn't exist
        print("Folder doesn't exist")
        return jsonify([])

#CSV_URL = "https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/data_IC.csv"

def fetch_csv_data(file_location):
    # Load CSV data from the file location
    try:
        csv_data = pd.read_csv(file_location)
        return csv_data.to_csv(index=False)
    except Exception as e:
        print(f"An error occurred while reading the CSV file: {e}")
        return None

  

@app.route('/process-form-data', methods=['PUT'])
def process_form_data():
    form_data = request.json
    # Access the form data fields as needed
    group1FileLocation = form_data.get('file1Location')
    group2FileLocation = form_data.get('file2Location')
    group1Files = form_data.get('group1SelectedFiles')
    group2Files = form_data.get('group2SelectedFiles')
    print("group 1 File location",group1FileLocation)
    print("group 2 File location",group2FileLocation)
    print("Group 1 Files",group1Files)
    print("Group 2 Files",group2Files)

    # patternFilesGroup1 = [fname for fname, status in group1Files.items() if '_jnt.csv' in fname and status['checked']]
    # print("Pattern Files",patternFilesGroup1)
    # # Now, we want to check if these files actually exist in your directory structure and collect them
    # grp_1_files = []
    # for fname in patternFilesGroup1:
    #     # Create the pattern for glob to match any files that include this file name in the directory/subdirectories
    #     folder_name, file_name = fname.split('-', 1) 
    #     search_pattern = os.path.join(group1FileLocation, folder_name, file_name)
    #     # Use glob to find matching files (in case there are matching files in subdirectories)
    #     matched_files = glob.glob(search_pattern, recursive=True)
    #     grp_1_files.extend(matched_files)

    # patternFilesGroup2 = [fname for fname, status in group2Files.items() if '_jnt.csv' in fname and status['checked']]
    # print("Pattern Files",patternFilesGroup2)
    # # Now, we want to check if these files actually exist in your directory structure and collect them
    # grp_2_files = []
    # for fname in patternFilesGroup2:
    #     # Create the pattern for glob to match any files that include this file name in the directory/subdirectories
    #     folder_name, file_name = fname.split('-', 1) 
    #     search_pattern = os.path.join(group1FileLocation, folder_name, file_name)
    #     # Use glob to find matching files (in case there are matching files in subdirectories)
    #     matched_files = glob.glob(search_pattern, recursive=True)
    #     grp_2_files.extend(matched_files)

    # # Check if the provided paths are valid directories
    # if not os.path.isdir(file_1_location) or not os.path.isdir(file_2_location):
    #     print("Error: Invalid directory paths.")
    #     sys.exit(1)


    # print("Group 1 Files",grp_1_files)
    # #print("\n\n\n\n group 1 files")
    # #print(grp_1_files)

    cols = ['foot', 'shank', 'thigh', 'trunk', 'hipx']
    # cols = ['AP', 'ML', 'VT']


    group1FileLocationOld= os.path.join(group1FileLocation, 'healthy_controls')
    print("Group 1 File Location Old",group1FileLocationOld)
    group2FileLocationOld = os.path.join(group1FileLocation, 'stroke_patients') 
    print("Group 2 File Location Old",group2FileLocationOld) 

    grp_1_filesOld = glob.glob(os.path.join(group1FileLocationOld, '**', '*jnt.csv'), recursive=True)
    grp_2_filesOld = glob.glob(os.path.join(group2FileLocationOld, '**', '*jnt.csv'), recursive=True)

    print("Group 1 Files Old",grp_1_filesOld)    

    # Generate images
    path = generate_images(group1FileLocationOld, group2FileLocationOld, grp_1_filesOld, grp_2_filesOld, cols)

    zipFilePath = create_zip_with_csv(path, 'output.zip')
    #print("CSV Data12",csv_data)
    # if csv_data:
    #     # Serve CSV file as a response
    #     #print("CSV Data 33",csv_data) 
    #     return Response(
    #         csv_data,
    #         mimetype="text/csv",
    #         headers={"Content-disposition":
    #                  "attachment; filename=data_IC.csv"})
    # else:
    #     return "Failed to fetch CSV data from the URL"
    return send_file(zipFilePath,
                    mimetype='application/zip',
                    as_attachment=True,
                    attachment_filename='data_csvs.zip')
  
if __name__ == '__main__':
    app.run(debug=True)
