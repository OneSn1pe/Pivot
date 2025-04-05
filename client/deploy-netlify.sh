#!/bin/bash

# Exit on error
set -e

# Display commands as they're executed
set -x

# Function to check if command exists
command_exists() {
  command -v "$1" >/dev/null 2>&1
}

# Check if Netlify CLI is installed
if ! command_exists netlify; then
  echo "Netlify CLI is not installed. Installing..."
  npm install -g netlify-cli
fi

# Deploy frontend
echo "Deploying frontend..."
cd /Users/kaustubhkislay/Pivot-8/client

# Install dependencies if needed
npm install

# Build the project
npm run build

# Deploy to Netlify
echo "Deploying to Netlify..."
npx netlify deploy --prod

echo "Deployment complete!"

# Deploy server as a separate site (optional)
# Comment this out if you're using Netlify Functions instead
# echo "Deploying server..."
# cd /Users/kaustubhkislay/Pivot-8/client/server
# npx netlify deploy --prod

echo "Deployment process complete!"
