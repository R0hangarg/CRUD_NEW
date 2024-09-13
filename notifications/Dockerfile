# Use an official Node.js runtime as a parent image
FROM node:18

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Install TypeScript and ts-node globally (if required)
RUN npm install -g typescript ts-node

# Copy the rest of the application code
COPY . .

# Compile TypeScript to JavaScript
RUN npm run build

# Expose the port the app runs on (adjust if needed)
EXPOSE 3001

# Command to run the app
CMD ["node", "dist/index.js"]
