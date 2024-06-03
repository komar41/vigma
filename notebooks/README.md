# eMoGis Python: How to Use

The python API for **eMoGis** is designed to facilitate a variety of tasks related to motion/gait data. The main functionalities are grouped into the following categories:

- [**Format Conversion**](#format-conversion): Convert motion capture files from various formats (TRC, MAT, C3D) to CSV files for easier handling and analysis.
- [**Feature Extraction**](#feature-extraction): Extract meaningful features from the motion capture data, such as joint angles, step parameters, and more.
- [**Data Processing**](#data-processing): Impute missing data, normalize data to specific gait cycles, and filter data to remove noise.
- [**Utility Functions**](#utility-functions): Plot data for visualization, load data into user interfaces, and organize data for analysis.

We have provided some mock data to let the users test the utilities of the library. The mock data should be inside **"eMoGis/notebooks/data"** folder. You should follow the same hierarchy and naming conventions for data storage displayed in the image below.

<img src="data_storage.png" width="400">

You can also check out this [notebook](https://github.com/komar41/eMoGis/blob/Docker/notebooks/_tutorial.ipynb) that illustrates how to use all functionalities of **eMoGis** Python API.

<a name="format-conversion"></a>

## 1. Format Conversion

### `trcToCSV()` / `matToCSV()` / `c3dToCSV()`

- Converts a TRC or, MAT or, C3D file to a CSV file, stores in the same directory from where data is read and returns the resulting DataFrame.

**Parameters:**

- `file_dir (str)`: The directory where the TRC/MAT/C3D file is located.
- `patient_id (str)`: The ID of the patient.
- `trial_no (int)`: The trial number.

**Returns:**

- `DataFrame`: The resulting DataFrame after conversion.

**Example:**

```Python
import emogis

file_dir = './data'
patient_id = "041602jb"
trial_no = 1

df = emogis.trcToCSV(file_dir, patient_id, trial_no) # Same for: emogis.matToCSV or, emogis.c3dToCSV.

print(df.head())
```

<a name="feature-extraction"></a>

## 2. Feature Extraction

### `motionToJointAngle()`

- Reads a motion file (CSV), processes its contents to extract joint angles, and optionally saves the result as a CSV file.

**Parameters:**

- `file_dir (str)`: The directory where the motion file is located.
- `patient_id (str)`: The ID of the patient.
- `trial (int)`: The trial number.
- `save (bool)`: Whether to save the resulting DataFrame as a CSV file (default is False). Saves the joint angle file in the same directory.

**Returns:**

- `DataFrame`: The resulting DataFrame after conversion.

**Example:**

```Python
import emogis

file_dir = "./data"
patient_id = "022318xz"
trial = 4

df = emogis.motionToJointAngle(file_dir, patient_id, trial, save=True)
print(df.head())
```

### `extract_stp()`

- Reads joint angle (CSV) and demographic data (CSV) files, processes the data, and calculates step parameters for one trial.

**Parameters:**

- `file_dir (str)`: The directory where the data files are located.
- `patient_id (str)`: The ID of the patient.
- `trial (int)`: The trial number.

**Returns:**

- `Tuple`: Contains step parameters (RstepLength, LstepLength, timeRswing, timeLswing, timeRgait, timeLgait, GaitSpeed).

**Example:**

```Python
import emogis

file_dir = "./data"
patient_id = "081517ap"
trial = 8

step_params = emogis.extract_stp(file_dir, patient_id, trial)

print("Patient ID: %s, Trial: %d" % (patient_id, trial))

print("RstepLength: %f, LstepLength: %f, timeRswing: %f, timeLswing: %f, timeRGait: %f, timeLGait: %f, GaitSpeed: %f"
      % (step_params[0], step_params[1], step_params[2], step_params[3], step_params[4], step_params[5], step_params[6]))
```

### `get_stp_params()`

- Extracts step parameters for all trials of a patient, returns the resulting DataFrame, and optionally saves the result as a CSV file.

**Parameters:**

- `file_dir (str)`: The directory where the data files are located.
- `patient_id (str)`: The ID of the patient.
- `save (bool)`: Whether to save the resulting DataFrame as a CSV file (default is False).
- `replace (bool)`: Whether to replace the existing step parameters CSV file (default is False). Should only be true when save is true.

**Returns:**

- `DataFrame`: The resulting DataFrame containing step parameters for all trials.

**Example:**

```Python
import emogis

file_dir = "./data"
patient_id = "081517ap"

df = get_stp_params(file_dir, patient_id, save=True, replace=True)
print(df.head())
```

<a name="data-processing"></a>

## 3. Data Processing

### `interpolate_impute()` / `knn_impute()` / `mice_impute()`

- Imputes missing data in a dataset using different imputation methods: linear interpolation, K-Nearest Neighbors (KNN), or Multiple Imputation by Chained Equations (MICE).

**Parameters:**

- `data_type (str)`: The type of data being imputed: 'grf' or 'jnt' (default is 'jnt').
- `save (bool)`: Whether to save the resulting DataFrame as a CSV file (default is False). If `save` is true, user must provide _file dir_, _patient_id_, and _trial_.
- `replace (bool)`: Whether to replace the existing file if saving (default is False). Should only be true when save is true.
- `**kwargs`: Additional keyword arguments, including:
  - `dataframe (DataFrame)`: The DataFrame to be imputed. If not provided, the function reads from a CSV file located via _file dir_, _patient_id_, and _trial_.
  - `file_dir (str)`: The directory where the data file is located.
  - `patient_id (str)`: The ID of the patient.
  - `trial (int)`: The trial number.

**Returns:**

- `DataFrame`: The resulting DataFrame after conversion.

**Example 1:**

```Python
import emogis

file_dir = './data'
patient_id = "022318xz"
trial = 4

df_imputed = emogis.knn_impute(file_dir = file_dir, patient_id = patient_id, trial = trial
                                 data_type = 'jnt', save = False) # same for mice_impute, interpolate_impute

print(df_imputed.head())
```

**Example 2:**

```Python
import emogis

file_dir = './data'
patient_id = "022318xz"
trial = 4

df = emogis.motionToJointAngle(file_dir, patient_id, trial)
df_imputed = emogis.mice_impute(dataframe = df,
                                    data_type = 'jnt',
                                        save = True, replace = True,
                                            file_dir = file_dir, patient_id = patient_id, trial = trial)

print(df_imputed.head())
```

### `filter_data()`

- Butterworth filters data using a specified cutoff frequency and order, then returns the filtered DataFrame.

**Parameters:**

- `data_type (str)`: The type of data being imputed: 'grf' or 'jnt' (default is 'jnt').
- `cutoff (int)`: Cutoff frequency for the filter (default is `6`).
- `order (int)`: Order of the filter (default is `4`).
- `save (bool)`: Whether to save the resulting DataFrame as a CSV file (default is False). If `save` is true, user must provide _file dir_, _patient_id_, and _trial_.
- `replace (bool)`: Whether to replace the existing file if saving (default is False). Should only be true when save is true.
- `**kwargs`: Additional keyword arguments, including:
  - `dataframe (DataFrame)`: The DataFrame to be imputed. If not provided, the function reads from a CSV file located via _file dir_, _patient_id_, and _trial_.
  - `file_dir (str)`: The directory where the data file is located.
  - `patient_id (str)`: The ID of the patient.
  - `trial (int)`: The trial number.

**Returns:**

- `DataFrame`: The resulting DataFrame after conversion.

**Example 1:**

```Python
import emogis

file_dir = './data'
patient_id = "022318xz"
trial = 4

df_filtered = emogis.filter_data(file_dir = file_dir, patient_id = patient_id, trial = trial
                                 data_type = 'jnt', save = False)

print(df_filtered.head())
```

**Example 2:**

```Python
import emogis

file_dir = './data'
patient_id = "022318xz"
trial = 4

df = emogis.motionToJointAngle(file_dir, patient_id, trial)
df_imputed = emogis.mice_impute(dataframe = df,
                                    data_type = 'jnt')
df_filtered = emogis.filter_data(dataframe = df,
                                    data_type = 'jnt',
                                        save = True, replace = True,
                                            file_dir = file_dir, patient_id = patient_id, trial = trial)

print(df_filtered.head())
```

### `normalize_data()`

- Normalizes a data file to a specific gait cycle and interpolates it to 100 points. Requires step times (CSV) to be available.

**Parameters:**

- `file_dir (str)`: The directory where the data files are located.
- `patient_id (str)`: The ID of the patient.
- `trial (int)`: The trial number.
- `data_type (str)`: The type of data being imputed: 'grf' or 'jnt' (default is 'jnt').
- `cycle (str)`: The gait cycle to normalize to ('L' for left, 'R' for right; default is 'L').
- `save (bool)`: Whether to save the resulting DataFrame as a CSV file (default is False).

- `**kwargs`: Additional keyword arguments, including:
  - `dataframe (DataFrame)`: The DataFrame to be normalized. If not provided, the function reads from a CSV file located via _file dir_, _patient_id_, and _trial_.

**Returns:**

- `DataFrame`: The resulting DataFrame after conversion.

**Example:**

```Python
import emogis

file_dir = './data'
patient_id = "022318xz"
trial = 4

df_normalized = emogis.normalize_data(file_dir, patient_id, trial, data_type = 'jnt', cycle='L', save = False)

print(df_normalized.head())
```

### `mark_step_times()`

- Marks the step times for a trial and saves the step information to a CSV file.

**Parameters:**

- `file_dir (str)`: The directory where the data files are located.
- `patient_id (str)`: The ID of the patient.
- `trial (int)`: The trial number.
- `L (list)`: List of tuples containing left foot step times (touch down, toe off).
- `R (list)`: List of tuples containing right foot step times (touch down, toe off).
- `trialtype (str)`: The type of trial (e.g., 'walk')

- `**kwargs`: Additional keyword arguments, including:
  - `dataframe (DataFrame)`: The DataFrame to be normalized. If not provided, the function reads from a CSV file located via _file dir_, _patient_id_, and _trial_.

**Returns:**

- `None`: Saves the step times to a CSV file.

**Example:**

```Python
import emogis

file_dir = './data'
patient_id = "022318xz"
trial = 4

Left = [(2.285, 2.9783), (3.4, 4.0833)]
Right = [(2.8083, 3.5617), (3.9283, 4.7083)]
trialtype = 'walk'

emogis.mark_step_times(file_dir, patient_id, trial, Left, Right, trialtype)
```

<a name="utility-functions"></a>

## 4. Utility functions

### `plot()`

- Plots data from a specified trial data file or dataframe, with options to 1) highlight steps, and 2) plotting for a specified gait cycle.

**Parameters:**

- `data_type (str)`: The type of data being imputed: 'grf' or 'jnt' (default is 'jnt').
- `steps (bool)`: Whether to highlight step times in the plot (default is 'False').
- `cycle`: Whether to normalize the data to a cycle (default is 'False').
- `**kwargs`: Additional keyword arguments, including:
  - `dataframe (DataFrame)`: The DataFrame to be plotted. If not provided, the function reads from a CSV file located via _file dir_, _patient_id_, and _trial_.
  - `file_dir (str)`: The directory where the data files are located.
  - `patient_id (str)`: The ID of the patient.
  - `trial (int)`: The trial number.

**Returns:**

- `None`: Displays the plot.

**Example 1:**

```Python
import emogis

file_dir = './data'
patient_id = "022318xz"
trial = 4

emogis.plot(data_type='jnt',
               file_dir = file_dir, patient_id = patient_id, trial = trial,
                    steps = True)
```

**Example 2:**

```Python
import emogis

file_dir = './data'
patient_id = "022318xz"
trial = 4

df_normalized = emogis.normalize_data(file_dir, patient_id, trial, data_type = 'jnt', cycle='L', save = False)

emogis.plot(df = df_normalized, data_type = 'jnt', cycle = True, hip = 'N')
```

### `load_data()`

- Loads data files for a patient, categorizes them under a group (e.g., stroke) and uploads it to the directory of the visual analytics system.

**Parameters:**

- `file_dir (str)`: The directory where the data files are located.
- `patient_id (str)`: The ID of the patient.
- `group (str)`: The group or category for the processed data (default is 'misc').
  **Returns:**
- `None`: Copies the processed data to the specified directory.

**Example:**

```Python
import emogis

file_dir = './data'
patient_id = "022318xz"

emogis.load_data(file_dir, patient_id, group='healthy_controls')
```
