Anaconda installation guide: https://www.datacamp.com/tutorial/installing-anaconda-windows

Note: Choose the alternative approach and add the path to the environment variables (Step 6). Add image.

- cd backend
- conda create --prefix ./envs
- conda config --set env_prompt '({name})'
- conda activate ./envs
- conda install flask flask_cors pandas numpy scipy scikit-learn
- start the server: python server.py
