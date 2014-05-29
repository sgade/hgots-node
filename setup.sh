#!/bin/sh

# Check for node and npm
which node > /dev/null || ( echo "You need Node.js installed to use this application. See https://nodejs.org for more details." && exit )
which npm > /dev/null  || ( echo "You need npm installed to use this application. Please install a version that is compatible with your nodejs version." && exit )
# Check for ruby (->sass)
which ruby > /dev/null || ( echo "You need ruby installed to use this application. Please install a current version from https://www.ruby-lang.org/de/downloads/." && exit )
which gem > /dev/null || ( echo "Ruby's 'gem' command could not be found. Please verify your ruby installation." && exit )

# WORK!
echo "INFO: This script might require admin rights to install some applications."

# Check for grunt
which grunt > /dev/null || ( echo "Installing grunt..." && ( npm install -g grunt-cli || sudo npm install -g grunt-cli ) )
# Check for bower
which bower > /dev/null || ( echo "Installing bower..." && ( npm install -g bower     || sudo npm install -g bower     ) )
# Check for sass
which sass > /dev/null || ( echo "Installing sass..." && ( gem install sass || sudo gem install sass ) )

# Running installs
echo "Now installing required packages."
# NPM
echo "Running npm install... This might take multiple minutes!"
npm install --production
# BOWER
echo "Running bower install. This should be fairly quick."
bower install

echo "Running production build..."
echo "NOTE: The build process may seem to pause for multiple minutes."
grunt build

echo "Everything is setup for production."
echo "If you want to develop with this instance, please run 'npm install' again by yourself to install development tools."
echo ""
echo "To start the application, run 'node src/app'."
