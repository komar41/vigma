#!/usr/bin/env python
# coding: utf-8


import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
from scipy.interpolate import interp1d
from scipy.signal import argrelextrema
import glob
import os
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
        #print("data files",data_files)
        for file in data_files:
            print("files",file)
            # Use os.path.dirname to get the directory name of the filepath
            directory_name = os.path.dirname(file)

            # Use os.path.basename to get the base name (i.e., the last component) of the directory
            desired_name = os.path.basename(directory_name)

            #print("desired files",desired_name)
            
            
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
        array_L_Lcycle, array_L_Rcycle = normalize_data(file_location, data_files, 'L-%s'%col if grf else 'L%s'%col)
        #print(array_L_Lcycle, array_L_Rcycle)
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
            df.loc[i, ('%s-m'%col)] = m
            df.loc[i, ('%s-l'%col)] = l
            df.loc[i, ('%s-u'%col)] = u
    
    return df



def process_data(file_location, data_files, col):
    if(col=='AP' or col=='ML' or col=='VT'):
        array_L_Lcycle, array_L_Rcycle, array_R_Lcycle, array_R_Rcycle, array_Lcycle, array_Rcycle = get_normalized_data(file_location, data_files, col)
        df_L_Lcycle, df_L_Rcycle, df_R_Lcycle, df_R_Rcycle, df_agg_Lcycle, df_agg_Rcycle = get_ensembled_data(array_L_Lcycle, 'L-%s'%col), get_ensembled_data(array_L_Rcycle, 'L-%s'%col), get_ensembled_data(array_R_Lcycle, 'R-%s'%col), get_ensembled_data(array_R_Rcycle, 'R-%s'%col), get_ensembled_data(array_Lcycle, '%s'%col), get_ensembled_data(array_Rcycle, '%s'%col)
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
            plt.plot(options['df_L1']['time'], options['df_L1']['L-%s-m'%col if grf else 'L%s-m'%col], color='#1b9e77', label='L1')

        if(options['L1_fill']):
            plt.fill_between(options['df_L1']['time'], options['df_L1']['L-%s-l'%col if grf else 'L%s-l'%col], options['df_L1']['L-%s-u'%col if grf else 'L%s-u'%col], color='#1b9e77', alpha=0.2)
        
        if(options['R1']):
            plt.plot(options['df_R1']['time'], options['df_R1']['R-%s-m'%col if grf else 'R%s-m'%col], color='#d95f02', label='R1')

        if(options['R1_fill']):
            plt.fill_between(options['df_R1']['time'], options['df_R1']['R-%s-l'%col if grf else 'R%s-l'%col], options['df_R1']['R-%s-u'%col if grf else 'R%s-u'%col], color='#d95f02', alpha=0.2)

        if(options['L2']):
            plt.plot(options['df_L2']['time'], options['df_L2']['L-%s-m'%col if grf else 'L%s-m'%col], color='#7570b3', label='L2')

        if(options['L2_fill']):
            plt.fill_between(options['df_L2']['time'], options['df_L2']['L-%s-l'%col if grf else 'L%s-l'%col], options['df_L2']['L-%s-u'%col if grf else 'L%s-u'%col], color='#7570b3', alpha=0.2)

        if(options['R2']):
            plt.plot(options['df_R2']['time'], options['df_R2']['R-%s-m'%col if grf else 'R%s-m'%col], color='#e7298a', label='R2')

        if(options['R2_fill']):
            plt.fill_between(options['df_R2']['time'], options['df_R2']['R-%s-l'%col if grf else 'R%s-l'%col], options['df_R2']['R-%s-u'%col if grf else 'R%s-u'%col], color='#e7298a', alpha=0.2)

    if(options['Agg1']):
        plt.plot(options['df_Agg1']['time'], options['df_Agg1']['%s-m'%col], color='#1b9e77', label='LR1')
    
    if(options['Agg1_fill']):
        plt.fill_between(options['df_Agg1']['time'], options['df_Agg1']['%s-l'%col], options['df_Agg1']['%s-u'%col], color='#1b9e77', alpha=0.2)

    if(options['Agg2']):
        plt.plot(options['df_Agg2']['time'], options['df_Agg2']['%s-m'%col], color='#d95f02', label='LR2')

    if(options['Agg2_fill']):
        plt.fill_between(options['df_Agg2']['time'], options['df_Agg2']['%s-l'%col], options['df_Agg2']['%s-u'%col], color='#d95f02', alpha=0.2)

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



if __name__ == "__main__":
    # Check if the required arguments are provided
    if len(sys.argv) != 3:
        print("Usage: python script.py <file_location_1> <file_location_2>")
        sys.exit(1)

    # Get the file locations from the command-line arguments
    file_location_1 = sys.argv[1]
    file_location_2 = sys.argv[2]

    # Check if the provided paths are valid directories
    if not os.path.isdir(file_location_1) or not os.path.isdir(file_location_2):
        print("Error: Invalid directory paths.")
        sys.exit(1)

    grp_1_files = glob.glob(os.path.join(file_location_1, '**', '*jnt.csv'), recursive=True)
    grp_2_files = glob.glob(os.path.join(file_location_2, '**', '*jnt.csv'), recursive=True)
    print("\n\n\n\n group 1 files")
    print(grp_1_files)

    cols = ['foot', 'shank', 'thigh', 'trunk', 'hipx']
    # cols = ['AP', 'ML', 'VT']

    for col in cols:
        if(col=='AP' or col=='ML' or col=='VT'):
            print("Inside IF", col)
            df_L_Lcycle_1, df_L_Rcycle_1, df_R_Lcycle_1, df_R_Rcycle_1, df_agg_Lcycle_1, df_agg_Rcycle_1 = process_data(file_location_1, grp_1_files, col)
            df_L_Lcycle_2, df_L_Rcycle_2, df_R_Lcycle_2, df_R_Rcycle_2, df_agg_Lcycle_2, df_agg_Rcycle_2 = process_data(file_location_2, grp_2_files, col)
            plot_data(col, df_Agg1=df_agg_Lcycle_1, df_Agg2=df_agg_Lcycle_2, Agg1=True, Agg2=True, Agg1_fill=True, Agg2_fill=True, save=True, path='./%s_Agg_Lcycle.png'%col)

        elif(col!='hipx' and col!='trunk'):
            print("Inside ELIF", col)
            df_L_Lcycle_1, df_L_Rcycle_1, df_R_Lcycle_1, df_R_Rcycle_1 = process_data(file_location_1, grp_1_files, col)
            df_L_Lcycle_2, df_L_Rcycle_2, df_R_Lcycle_2, df_R_Rcycle_2 = process_data(file_location_2, grp_2_files, col)
            plot_data(col, df_L1=df_L_Lcycle_1, df_L2=df_L_Lcycle_2, L1=True, L2=True, L1_fill=True, L2_fill=True, save=True, path='./%s_L_Lcycle.png'%col)

        else:
            print("Inside ELSE", col)
            df_Lcycle_1, df_Rcycle_1 = process_data(file_location_1, grp_1_files, col)
            df_Lcycle_2, df_Rcycle_2 = process_data(file_location_2, grp_2_files, col)
            plot_data(col, df_Agg1=df_Lcycle_1, df_Agg2=df_Lcycle_2, Agg1=True, Agg2=True, Agg1_fill=True, Agg2_fill=True, save=True, path='./s%s_Lcycle.png'%col)





# file_location_1 = './data/healthy_controls/'
# grp_1_files = glob.glob(file_location_1 + '*/*jnt.csv')
# # grp_1_files = glob.glob(file_location_1 + '*/*grf.csv')
# print( grp_1_files)

# file_location_2 = './data/stroke_patients/'
# grp_2_files = glob.glob(file_location_2 + '*/*jnt.csv')
# # grp_2_files = glob.glob(file_location_2 + '*/*grf.csv')




# ### Local & Global Minima/Maxima
# (Have backend function to fetch these values and highlight these points in the lines in frontend)

# ### find local minima and maxima
# ```
# minima_1 = argrelextrema(df_Lcycle_1['%s-m'%col].values, np.less)[0]
# maxima_1 = argrelextrema(df_Lcycle_1['%s-m'%col].values, np.greater)[0]
# minima_2 = argrelextrema(df_Lcycle_2['%s-m'%col].values, np.less)[0]
# maxima_2 = argrelextrema(df_Lcycle_2['%s-m'%col].values, np.greater)[0]
# ```
# 
# ### global minima and maxima
# ```
# global_minima_1 = df_Lcycle_1['%s-m'%col].idxmin()
# global_maxima_1 = df_Lcycle_1['%s-m'%col].idxmax()
# global_minima_2 = df_Lcycle_2['%s-m'%col].idxmin()
# global_maxima_2 = df_Lcycle_2['%s-m'%col].idxmax()
# ```

# ### Save normalized joint angles as CSV files: 
# - Lcycle: foot(L,R), shank(L,R), thigh(L,R), trunk, hipx
# - Rcycle: foot(L,R), shank(L,R), thigh(L,R), trunk, hipx
# 
# ### Save normalized grfs as CSV files:
# - Lcycle: AP (L, R, Agg), ML (L, R, Agg), VT (L, R, Agg)
# - Rcycle: AP (L, R, Agg), ML (L, R, Agg), VT (L, R, Agg)

# Complete the table 1 (Evaluation)
