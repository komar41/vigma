from sklearn import linear_model
from sklearn.experimental import enable_iterative_imputer
from sklearn.impute import IterativeImputer, KNNImputer
import pandas as pd
from .utils import *


def interpolate(data):
    df = file_or_df(data)

    df = df.drop(columns=['#frame'])
    df.set_index('time', inplace=True)
    df = df.interpolate(limit_direction='both', method='spline', order=1)
    df = df.reset_index()

    return df


# Add KNN imputation
def knn_impute(data):
    df = file_or_df(data)

    df_knn = df.drop(columns=['time', '#frame'])

    knn_imputer = KNNImputer(n_neighbors=5, weights='uniform')

    df_knn_imputed = pd.DataFrame(
        knn_imputer.fit_transform(df_knn), columns=df_knn.columns)

    df_knn_imputed['time'] = df['time']
    df_knn_imputed['#frame'] = df['#frame']

    return df_knn_imputed


def mice_impute(data):
    df = file_or_df(data)

    df_mice = df.drop(columns=['time', '#frame'])

    mice_imputer = IterativeImputer(estimator=linear_model.BayesianRidge(
    ), n_nearest_features=None, imputation_order='ascending', max_iter=100)

    df_mice_imputed = pd.DataFrame(
        mice_imputer.fit_transform(df_mice), columns=df_mice.columns)

    df_mice_imputed['time'] = df['time']
    df_mice_imputed['#frame'] = df['#frame']

    return df_mice_imputed
