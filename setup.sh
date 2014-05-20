#!/bin/sh

# Check for node and npm
which node > /dev/null || ( echo "You need Node.js installed to use this application. See https://nodejs.org for more details." && exit )
which npm > /dev/null  || ( echo "You need npm installed to use this application. Please install a version that is compatible with your nodejs version." && exit )

# WORK!
echo "INFO: This script might require admin rights to install some applications."

# Check for grunt
which grunt > /dev/null || ( echo "Installing grunt..." && ( npm install -g grunt-cli || sudo npm install -g grunt-cli ) )
# Check for bower
which bower > /dev/null || ( echo "Installing bower..." && ( npm install -g bower     || sudo npm install -g bower     ) )

# Running installs
echo "Running npm install... This might take multiple minutes!"
npm install --production

echo "Running bower install. This should be fairly quick."
bower install

echo "Running first build..."
grunt build

echo "Everything is setup for production."
echo "If you want to develop with this instance, please run 'npm install' again by yourself to install development tools."
