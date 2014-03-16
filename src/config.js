/**
 * Application configuration module.
 * This module handles everything related with the application's configuration.
 * @module config
 * @author Sören Gade
 * */

var fs = require('fs');
var path = require('path');
var assert = require('assert');

// files to be loaded, in this order
// if the config file was found the others are skipped
var configLoad = [ 'config.json' ];

var env = process.env.NODE_ENV;
if ( env ) {
  var configFile = 'config.' + env + '.json';
  configLoad.splice(0, 0, configFile);
}

var config = null;
for ( var i = 0; i < configLoad.length; i++ ) {
  var file = path.join(__dirname, "..", configLoad[i]);
  // console.log("Config: Checking for config at ", file, "...");
  if ( fs.existsSync(file) ) {
    config = require(file);
    // console.log("Config: Loaded config from ", file + ".");
    break;
  }
}
assert(config != null, "No config file found.");

module.exports = config;
