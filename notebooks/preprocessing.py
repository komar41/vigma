import os
import numpy as np
from scipy.signal import butter, filtfilt
from sklearn import linear_model
from sklearn.experimental import enable_iterative_imputer
from sklearn.impute import IterativeImputer, KNNImputer
import pandas as pd
from scipy.interpolate import interp1d

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

def filter_data(df, data_type='jnt', cutoff=6, order=4):

    if('#frame' in df.columns): df_filter = df.drop(columns=['#frame'])
    df_filter = df_filter.astype(float)
    df_filter.set_index('time', inplace=True)

    df_filter = df_filter.apply(lambda x: filter_signal(
        x.to_numpy(), x.index.to_numpy(), cutoff, order), axis=0)

    df_filter = df_filter.reset_index()
    if('#frame' in df.columns): df_filter['#frame'] = df['#frame']

    return df_filter

''' missing value imputation '''

def interpolate_impute(df, data_type='jnt'):

    if('#frame' in df.columns): df_interpolate = df.drop(columns=['#frame'])
    df_interpolate = df_interpolate.astype(float)
    df_interpolate.set_index('time', inplace=True)
    df_interpolate = df_interpolate.interpolate(limit_direction='both', method='spline', order=1)
    df_interpolate = df_interpolate.reset_index()
    if('#frame' in df.columns): df_interpolate['#frame'] = df['#frame']

    return df_interpolate

def knn_impute(df, data_type = 'jnt'):

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

def mice_impute(df, data_type='jnt'):

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

    return df_mice_imputed

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

def normalize_data(df, df_step, patient_id, trial, data_type='jnt', cycle = 'L'):
    def normalize(data, data_step):
        if(data_step['footing'].values[0] == 'L'):
            if(cycle == 'L'): df = data[(data['time'] >= data_step['touch down'].values[0]) & (data['time'] <= data_step['touch down.2'].values[0])]
            else: df = data[(data['time'] >= data_step['touch down.1'].values[0]) & (data['time'] <= data_step['touch down.3'].values[0])]
        else:
            if(cycle == 'L'): df = data[(data['time'] >= data_step['touch down.1'].values[0]) & (data['time'] <= data_step['touch down.3'].values[0])]
            else: df = data[(data['time'] >= data_step['touch down'].values[0]) & (data['time'] <= data_step['touch down.2'].values[0])]

        return df

    df_step = df_step[(df_step['trial'] == int(trial)) & (df_step['subject'] == patient_id)]

    data = normalize(df, df_step)
    data = interpolate_data(data, 100)

    return data
