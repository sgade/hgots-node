#!/bin/sh

echo "Welcome to the setup routine of hgots-node."
echo "Please make sure you have the latest version of the source code at hand."
echo "If you want to check for and download new versions, please run 'git pull'."
echo ""
echo "INFO: This script will notify you about required software and may also install required dependencies for production."
echo "INFO: If you want to use Bonjour to broadcast your web server and you are running on Linux, please run 'apt-get install libavahi-compat-libdnssd-dev' before you start the application."
# Check for node and npm
which node > /dev/null || ( echo "You need Node.js installed to use this application. See https://nodejs.org for more details." && exit )
which npm > /dev/null  || ( echo "You need npm installed to use this application. Please install a version that is compatible with your nodejs version." && exit )
# Check for ruby (->sass)
which ruby > /dev/null || ( echo "You need ruby installed to use this application. Please install a current version from https://www.ruby-lang.org/de/downloads/." && exit )
which gem > /dev/null || ( echo "Ruby's 'gem' command could not be found. Please verify your ruby installation." && exit )

# WORK!
echo "INFO: This script might require admin rights to install some applications."
echo "***** ***** ***** ***** *****"

# Check for grunt
which grunt > /dev/null || ( echo "Installing grunt..." && ( ( npm install -g grunt-cli || sudo npm install -g grunt-cli ) || ( echo "Installing grunt failed." && exit ) ) )
# Check for bower
which bower > /dev/null || ( echo "Installing bower..." && ( ( npm install -g bower     || sudo npm install -g bower     ) || ( echo "Installing bower failed." && exit ) ) )
# Check for sass
which sass > /dev/null || ( echo "Installing sass..."   && ( ( gem install sass         || sudo gem install sass         ) || ( echo "Installing sass failed." && exit ) ) )

echo "***** ***** ***** ***** *****"

# Running installs
echo "Now installing required packages."
# NPM
echo "Running npm install... This might take multiple minutes!"
npm install --production
# BOWER
echo "Running bower install. This should be fairly quick."
bower install

echo "***** ***** ***** ***** *****"

echo "Running production build..."
echo "INFO: The build process may seem to be stuck during the process for several minutes."
grunt build

echo "***** ***** ***** ***** *****"
echo "Everything is setup for production."
echo "If you want to develop with this instance, please run 'npm install' again by yourself to install development tools."
echo ""
echo "To start the application, run 'node src/app'."
echo "***** ***** ***** ***** *****"
