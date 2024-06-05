import os
import numpy as np
from scipy.signal import butter, filtfilt
from sklearn import linear_model
from sklearn.experimental import enable_iterative_imputer
from sklearn.impute import IterativeImputer, KNNImputer
import pandas as pd
from scipy.interpolate import interp1d

from utils import *

''' filtering '''

def filter_signal(x, t, cutoff, order):
    
    valid_indices = ~np.isnan(x)
    x_valid = x[valid_indices]
    t_valid = t[valid_indices]
    
    fs = 1 / (t_valid[1] - t_valid[0])  # Sampling frequency
    nyq = 0.5 * fs
    b, a = butter(order, cutoff/nyq, btype='low')
    xf_valid = filtfilt(b, a, x_valid)
    
    # Create a full length output array filled with nan
    xf_full = np.full_like(x, np.nan)
    xf_full[valid_indices] = xf_valid
    
    return xf_full

def filter_data(data_type='jnt', cutoff=6, order=4, save=False, replace=False, **kwargs):
    if('dataframe' in kwargs):
        df = kwargs['dataframe']
    else:
        df = pd.read_csv('%s/%s/%s_%s_%s.csv' % (kwargs['file_dir'], kwargs['patient_id'], kwargs['patient_id'], kwargs['trial'], data_type))

    if('#frame' in df.columns): df_filter = df.drop(columns=['#frame'])
    df_filter = df_filter.astype(float)
    df_filter.set_index('time', inplace=True)

    df_filter = df_filter.apply(lambda x: filter_signal(
        x.to_numpy(), x.index.to_numpy(), cutoff, order), axis=0)

    df_filter = df_filter.reset_index()
    if('#frame' in df.columns): df_filter['#frame'] = df['#frame']

    if(save):
        data_type = kwargs['data_type']
        pid = kwargs['patient_id']
        trial = kwargs['trial']
        file_location = kwargs['file_dir']
        savepath = '%s/%s/%s_%s_%s.csv' % (file_location, pid, pid, trial, data_type)
        if(replace or not os.path.exists(savepath)):
            df_filter.to_csv('%s/%s/%s_%s_%s.csv' % (file_location, pid, pid, trial, data_type), index=False)
        else:
            df_filter.to_csv('%s/%s/%s_%s_%s_f.csv' % (file_location, pid, pid, trial, data_type), index=False)

    return df_filter

''' missing value imputation '''

def interpolate_impute(data_type='jnt', save = False, replace = False, **kwargs):
    if('dataframe' in kwargs):
        df = kwargs['dataframe']
    else:
        df = pd.read_csv('%s/%s/%s_%s_%s.csv' % (kwargs['file_dir'], kwargs['patient_id'], kwargs['patient_id'], kwargs['trial'], data_type))

    if('#frame' in df.columns): df_interpolate = df.drop(columns=['#frame'])
    df_interpolate = df_interpolate.astype(float)
    df_interpolate.set_index('time', inplace=True)
    df_interpolate = df_interpolate.interpolate(limit_direction='both', method='spline', order=1)
    df_interpolate = df_interpolate.reset_index()
    if('#frame' in df.columns): df_interpolate['#frame'] = df['#frame']

    if(save):
        data_type = kwargs['data_type']
        pid = kwargs['patient_id']
        trial = kwargs['trial']
        file_location = kwargs['file_dir']
        savepath = '%s/%s/%s_%s_%s.csv' % (file_location, pid, pid, trial, data_type)
        if(replace or not os.path.exists(savepath)):
            df_interpolate.to_csv('%s/%s/%s_%s_%s.csv' % (file_location, pid, pid, trial, data_type), index=False)
        else:
            df_interpolate.to_csv('%s/%s/%s_%s_%s_i.csv' % (file_location, pid, pid, trial, data_type), index=False)

    return df_interpolate

def knn_impute(data_type = 'jnt', save = False, replace = False, **kwargs):
    

    if('dataframe' in kwargs):
        df = kwargs['dataframe']
    else:
        df = pd.read_csv('%s/%s/%s_%s_%s.csv' % (kwargs['file_dir'], kwargs['patient_id'], kwargs['patient_id'], kwargs['trial'], data_type))

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

    if(save):
        data_type = kwargs['data_type']
        pid = kwargs['patient_id']
        trial = kwargs['trial']
        file_location = kwargs['file_dir']
        savepath = '%s/%s/%s_%s_%s.csv' % (file_location, pid, pid, trial, data_type)
        if(replace or not os.path.exists(savepath)):
            df_knn_imputed.to_csv('%s/%s/%s_%s_%s.csv' % (file_location, pid, pid, trial, data_type), index=False)
        else:
            df_knn_imputed.to_csv('%s/%s/%s_%s_%s_i.csv' % (file_location, pid, pid, trial, data_type), index=False)

    return df_knn_imputed

def mice_impute(data_type='jnt', save = False, replace = False, **kwargs):
    if('dataframe' in kwargs):
        df = kwargs['dataframe']
    else:
        df = pd.read_csv('%s/%s/%s_%s_%s.csv' % (kwargs['file_dir'], kwargs['patient_id'], kwargs['patient_id'], kwargs['trial'], data_type))

    columns = ['time', '#frame']
    existing_columns_to_drop = [col for col in columns if col in df.columns]

    df_mice = df.drop(columns=existing_columns_to_drop)

    mice_imputer = IterativeImputer(estimator=linear_model.BayesianRidge(
    ), n_nearest_features=None, imputation_order='ascending', max_iter=100)

    df_mice_imputed = pd.DataFrame(
        mice_imputer.fit_transform(df_mice), columns=df_mice.columns)

    for col in columns:
        if col in df.columns:
            df_mice_imputed[col] = df[col]

    if(save):
        data_type = kwargs['data_type']
        pid = kwargs['patient_id']
        trial = kwargs['trial']
        file_location = kwargs['file_dir']
        savepath = '%s/%s/%s_%s_%s.csv' % (file_location, pid, pid, trial, data_type)
        if(replace or not os.path.exists(savepath)):
            df_mice_imputed.to_csv('%s/%s/%s_%s_%s.csv' % (file_location, pid, pid, trial, data_type), index=False)
        else:
            df_mice_imputed.to_csv('%s/%s/%s_%s_%s_i.csv' % (file_location, pid, pid, trial, data_type), index=False)

    return df_mice_imputed

''' mark step times '''

def mark_step_times(file_dir, patient_id, trial, L, R, trialtype):

    if(L[0][0] < L[1][0]):
        p1, p2, p3, p4 = L[0], R[0], L[1], R[1]
        f1, f2, f3, f4 = 'L', 'R', 'L', 'R'
    else:
        p1, p2, p3, p4 = R[0], L[0], R[1], L[1]
        f1, f2, f3, f4 = 'R', 'L', 'R', 'L'

    if os.path.exists('%s/%s/%sstep.csv' % (file_dir, patient_id, patient_id)):
        df_step = pd.read_csv('%s/%s/%sstep.csv' % (file_dir, patient_id, patient_id))
        
        if not df_step[(df_step['trial'] == trial) & (df_step['trialtype'] == trialtype)].empty:
            print('Step time for trial already exists. Do you want to overwrite: ? (y/n)')
            answer = input()
            if answer == 'y':
                new_row = {'subject': patient_id, 'trial': trial, 'trialtype': trialtype, 'touch down': p1[0], 'toe off': p1[1], 'footing': f1, 'touch down.1': p2[0], 'toe off.1': p2[1], 'footing.1': f2, 'touch down.2': p3[0], 'toe off.2': p3[1], 'footing.2': f3, 'touch down.3': p4[0], 'toe off.3': p4[1], 'footing.3': f4}
                df_step = df_step[(df_step['trial'] != trial) & (df_step['trialtype'] != trialtype)]
                df_step = pd.concat([df_step, pd.DataFrame(new_row, index=[0])], ignore_index=True)

                df_step = df_step.sort_values(by=['subject', 'trial'])
                df_step = df_step.reset_index(drop=True)

                df_step.columns = ['subject', 'trial', 'trialtype', 'touch down', 'toe off', 'footing', 'touch down', 'toe off', 'footing', 'touch down', 'toe off', 'footing', 'touch down', 'toe off', 'footing']
                df_step.to_csv('%s/%s/%sstep.csv' % (file_dir, patient_id, patient_id), index=False)
            else:
                print('Not overwriting')
        
        else:
            new_row = {'subject': patient_id, 'trial': trial, 'trialtype': trialtype, 'touch down': p1[0], 'toe off': p1[1], 'footing': f1, 'touch down.1': p2[0], 'toe off.1': p2[1], 'footing.1': f2, 'touch down.2': p3[0], 'toe off.2': p3[1], 'footing.2': f3, 'touch down.3': p4[0], 'toe off.3': p4[1], 'footing.3': f4}
            df_step = pd.concat([df_step, pd.DataFrame(new_row, index=[0])], ignore_index=True)

            df_step = df_step.sort_values(by=['subject', 'trial'])
            df_step = df_step.reset_index(drop=True)

            df_step.columns = ['subject', 'trial', 'trialtype', 'touch down', 'toe off', 'footing', 'touch down', 'toe off', 'footing', 'touch down', 'toe off', 'footing', 'touch down', 'toe off', 'footing']
            df_step.to_csv('%s/%s/%sstep.csv' % (file_dir, patient_id, patient_id), index=False)

    else:
        new_row = {'subject': patient_id, 'trial': trial, 'trialtype': trialtype, 'touch down': p1[0], 'toe off': p1[1], 'footing': f1, 'touch down.1': p2[0], 'toe off.1': p2[1], 'footing.1': f2, 'touch down.2': p3[0], 'toe off.2': p3[1], 'footing.2': f3, 'touch down.3': p4[0], 'toe off.3': p4[1], 'footing.3': f4}
        df_step = pd.DataFrame(new_row, index=[0])
        df_step.columns = ['subject', 'trial', 'trialtype', 'touch down', 'toe off', 'footing', 'touch down', 'toe off', 'footing', 'touch down', 'toe off', 'footing', 'touch down', 'toe off', 'footing']
        df_step.to_csv('%s/%s/%sstep.csv' % (file_dir, patient_id, patient_id), index=False)

    return

''' normalize data '''

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

def normalize_data(file_dir, patient_id, trial, data_type='jnt', cycle = 'L', save=False, **kwargs):
    def normalize(data, data_step):
        df = None
        if(data_step['footing'].values[0] == 'L'):
            if(cycle == 'L'): df = data[(data['time'] >= data_step['touch down'].values[0]) & (data['time'] <= data_step['touch down.2'].values[0])]
            else: df = data[(data['time'] >= data_step['touch down.1'].values[0]) & (data['time'] <= data_step['touch down.3'].values[0])]
        else:
            if(cycle == 'L'): df = data[(data['time'] >= data_step['touch down.1'].values[0]) & (data['time'] <= data_step['touch down.3'].values[0])]
            else: df = data[(data['time'] >= data_step['touch down'].values[0]) & (data['time'] <= data_step['touch down.2'].values[0])]

        return df

    if('dataframe' in kwargs):
        data = kwargs['dataframe']
    else:
        if(data_type == 'grf'): data = pd.read_csv(file_dir + '/' + patient_id + '/' + patient_id + "_" + str(trial) + "_grf.csv")
        elif(data_type == 'jnt'): data = pd.read_csv(file_dir + '/' + patient_id + '/' + patient_id + "_" + str(trial) + "_jnt.csv")

    data_step = pd.read_csv("%s/%s/%sstep.csv" % (file_dir, patient_id, patient_id))
    data_step = data_step[(data_step['trial'] == int(trial)) & (data_step['patient_id'] == patient_id)]

    data = normalize(data, data_step)
    data = interpolate_data(data, 100)

    if(save):
        data.to_csv('%s/%s/%s_%s_%s_cyc_%s.csv' % (file_dir, patient_id, patient_id, trial, data_type, cycle), index=False)

    return data
