import os
from flask import Flask, jsonify, request
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# Configuration parameters
#app.config['FOLDER_DIRECTORY'] = 'data/'


@app.route('/send-data', methods=['POST'])
def receive_data():
    data = request.json
    print("Received data:", data)
    text_input = data.get('fileLocation')
    # Configuration parameters
    app.config['FOLDER_DIRECTORY'] = text_input
    # Process the received data here
    print("Received text input:", text_input)
    #     return jsonify({'message': 'Data received successfully'})




    # @app.route('/get_folder_names')
    # def get_folder_names():
    #     # Fetch folder names from the configured directory path
    #     folder_directory = app.config.get('FOLDER_DIRECTORY')
    folder_directory = app.config.get('FOLDER_DIRECTORY')  
    if folder_directory and os.path.exists(folder_directory):
        folder_names = [folder for folder in os.listdir(folder_directory) if os.path.isdir(os.path.join(folder_directory, folder))]
        # Return folder names as JSON
        return jsonify(folder_names)
    else:
        # Return an empty JSON array
        return jsonify([])

if __name__ == '__main__':
    app.run(debug=True)
