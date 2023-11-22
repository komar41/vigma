# export FLASK_APP=server.py
# flask run

# flask --app server run --debug
# environment: conda flask_t
from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS

import pandas as pd
import numpy as np
import os

import re


app = Flask(__name__)
# CORS(app)
CORS(app, support_credentials=True)


@app.route('/')
def home():
    print('bs')
    return send_from_directory('./', 'index.html')


# post request to receive step times for a patient
@app.route('/post_patient_data/', methods=['POST'])
def post_patient_data():
    data = request.get_json()  # Parse the request body as JSON
    print(data)
    response = {'message': 'success'}
    return jsonify(response), 200


@app.route('/check_patient_exists', methods=['GET'])
def check_patient_exists():
    file_location = request.args.get('file_location')
    patient_id = request.args.get('patient_id')

    filepath = ""
    if (patient_id and file_location):
        filepath = "%s/%s/" % (file_location,
                               patient_id)

    if os.path.exists(filepath):
        return jsonify(True)
    else:
        return jsonify(False)


@app.route('/get_trial_data_types', methods=['GET'])
def get_trial_data_types():
    file_location = request.args.get('file_location')
    patient_id = request.args.get('patient_id')
    trial_id = request.args.get('trial_id')

    path = "%s/%s/" % (file_location,
                       patient_id)
    # get all the filnames from the folder
    file_list = next(os.walk(path), (None, None, []))[2]

    # find files with trial id
    trial_files = []
    for file in file_list:
        if trial_id in file:
            trial_files.append(file)

    # Regular expression pattern to extract the data type
    pattern = r'_(\w+)\.csv'

    # Find data types
    data_types = []
    for file in trial_files:
        match = re.search(pattern, file)
        if match:
            data_type = match.group(1)
            data_type = re.sub(r'\d+_', '', data_type)
            data_types.append(data_type)

    data_types = (list(set(data_types)))
    data_types.sort()

    return jsonify(data_types)


@app.route('/get_patient_trials', methods=['GET'])
def get_patient_trials():

    file_location = request.args.get('file_location')
    patient_id = request.args.get('patient_id')

    path = "%s/%s/" % (file_location,
                       patient_id)
    # get all the filnames from the folder
    file_list = next(os.walk(path), (None, None, []))[2]  # [] if no file
    # Regular expression pattern to extract the trial number
    pattern = r'(\d+)_'

    # Find trial numbers
    trial_numbers = []
    for file in file_list:
        match = re.search(pattern, file)
        if match:
            trial_number = match.group(1)
            trial_numbers.append(trial_number)

    trial_numbers = (list(set(trial_numbers)))
    trial_numbers = [int(i) for i in trial_numbers]
    trial_numbers.sort()

    return jsonify(trial_numbers)


@app.route('/get_patient_data', methods=['GET'])
def get_patient_data():
    import re
    file_location = request.args.get('file_location')
    patient_id = request.args.get('patient_id')
    trial_id = request.args.get('trial_id')
    data_type = request.args.get('data_type')
    print("Patient ID: " + patient_id + " Trial ID: " + trial_id)
    # read csv with patient id and trial id
    filepath = "%s/%s/%s_%s_%s.csv" % (file_location,
                                       patient_id, patient_id, trial_id, data_type)

    if os.path.exists(filepath):
        data = pd.read_csv(filepath)

        data = data.astype(object).replace(np.nan, 'null')
        data = data.to_dict(orient='records')
        return jsonify(data)

    else:
        return jsonify([])
    # return jsonify(message="My name is " + name + " and I am " + str(age) + " years old")


@app.route('/with_url_variables/<string:name>/<int:age>')
def with_url_variables(name: str, age: int):
    return jsonify(message="My name is " + name + " and I am " + str(age) + " years old")


if __name__ == '__main__':
    app.debug = True
    app.run()
