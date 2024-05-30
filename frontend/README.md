<!-- docker compose up --build -->

Install node on your computer. Easiest way is to use the installer: https://nodejs.org/en/download/prebuilt-installer

Or,

On Node's download page referenced in step 1. there is now a .zip archive download which contains both the nodejs executable and npm. Unpacking that to a suitable path and adding this path to your PATH environment variable will give you both node and npm.

Check if node and npm commands work using the terminal.

Open a terminal and type:

- node -v
- npm -v

You should be seeing the version numbers installed for node and npm.

Open a terminal in the emogis repository.

- cd frontend
- npm install --legacy-peer-deps
- npm start
