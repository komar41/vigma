# Installation Guide

[Video guide]() of all the steps for Windows users.

## Software Installations

- Follow this [guide](https://docs.anaconda.com/free/anaconda/install/index.html) to install Anaconda.
- Follow this [link](https://nodejs.org/en/download/prebuilt-installer) to install Node. Prebuilt installer is the easiest way to perform installation.

## Project Setup

Download a zipped version of emogis from [here](https://github.com/komar41/eMoGis). Check the image below for reference on how to download the zip file from the link.

Unzip the folder. Now, open a terminal inside the **eMoGis** folder.

- Run the following commands in the terminal to install the necessary dependencies for the **eMoGis** Python library (Ignore the lines with hash (**#**). Those are comments explaining each command):

  ```bash
  # Navigate to the notebooks directory
  cd notebooks

  # Create a new conda environment
  conda create --prefix ./envs
  conda config --set env_prompt '({name})'

  # Activate the conda environment
  conda activate ./envs

  # Install necessary Python libraries
  conda install numpy pandas scipy scikit-learn matplotlib ipykernel fuzzywuzzy plotly

  # Install additional Python packages via pip
  pip install c3d
  pip install --upgrade nbformat
  ```

- Now, run the following commands in the terminal to install the necessary dependencies for the **server** side setup.

  ```bash
  # Navigate to the backend directory
  cd ../backend

  # Create a new conda environment
  conda create --prefix ./envs
  conda config --set env_prompt '({name})'

  # Activate the conda environment
  conda activate ./envs

  # Install necessary Python libraries
  conda install flask flask_cors pandas numpy scipy scikit-learn
  ```

- Finally, run the following command in the terminal to install the necessary dependencies for the client side setup.

  ```bash
  # Navigate to the frontend directory
  cd ../frontend

  # Install the necessary client side dependencies.
  npm install --legacy-peer-deps
  ```

## Run the application

- Open a terminal inside the eMoGis folder. Run the following commands in the terminal:

  ```bash
  # Navigate to the backend directory
  cd backend

  # Start the server
  python server.py
  ```

- Open another terminal inside the eMoGis folder. Run the following commands in the terminal:

  ```bash
  # Navigate to the frontend directory
  cd frontend

  # Start the web application
  npm start
  ```

  This will open a tab in your browser and you're all set to use eMoGis system.
