import os
from flask import Flask, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# Configuration parameters
app.config['FOLDER_DIRECTORY'] = 'data/'

@app.route('/get_folder_names')
def get_folder_names():
    # Fetch folder names from the configured directory path
    folder_directory = app.config['FOLDER_DIRECTORY']
    folder_names = [folder for folder in os.listdir(folder_directory) if os.path.isdir(os.path.join(folder_directory, folder))]

    # Return folder names as JSON
    return jsonify(folder_names)

if __name__ == '__main__':
    app.run(debug=True)
