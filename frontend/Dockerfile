# Use an official Node runtime as a parent image
FROM node:16-alpine

# Set the working directory in the container
WORKDIR /app

# Copy the current directory contents into the container at /app
COPY . /app

# Install any needed packages specified in package.json
RUN npm install --legacy-peer-deps

# Build the project for production
RUN npm run build

# Install serve to run the application
RUN npm install -g serve

# Set the command to start the server
CMD ["serve", "-s", "build", "-l", "3000"]

# Make port 3000 available to the world outside this container
EXPOSE 3000
