Anaconda installation guide: https://www.datacamp.com/tutorial/installing-anaconda-windows

Note: Choose the alternative approach and add the path to the environment variables (Step 6). Add image.

- cd notebooks
- conda create --prefix ./envs
- conda config --set env_prompt '({name})'
- conda activate ./envs
- conda install numpy pandas scipy scikit-learn matplotlib ipykernel fuzzywuzzy plotly
- pip install c3d
- pip install --upgrade nbformat
