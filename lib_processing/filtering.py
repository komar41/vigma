import numpy as np
from scipy.signal import butter, filtfilt


def filter_signal(x, t, cutoff, order):
    fs = 1 / (t[1] - t[0])  # Sampling frequency
    nyq = 0.5 * fs
    b, a = butter(order, cutoff/nyq, btype='low')
    xf = filtfilt(b, a, x)

    return xf


def filter_df(df, cutoff=6, order=4):
    df_filter = df.drop(columns=['#frame'])
    df_filter.set_index('time', inplace=True)
    df_filter = df_filter.apply(lambda x: filter_signal(
        x.to_numpy(), x.index.to_numpy(), cutoff, order), axis=0)
    df_filter = df_filter.reset_index()
    df_filter['#frame'] = df['#frame']

    return df_filter
