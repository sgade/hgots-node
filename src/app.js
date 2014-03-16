/**
 * Main application module.
 * Project started: 16.03.2014 - 00:21
 * @module app
 * @author Sören Gade
 *
 * @requires config
 * @requires web/index
 * @requires io/serial
 * @requires io/rfidreader
 * */

var config = require('./config');
var web = require('./web/');
var serial = require('./io/serial');
var rfidreader = require('./io/rfidreader');

console.log("Hello World!");
console.log("This is going to be a full featured door lock system.");

/**
 * Starts the webserver.
 * */
function startWeb() {
  web.init();
  web.start(function() {
    console.log("Web interface running.");
  });
}

/**
 * Initializes the connection with the RFID reader.
 * */
function initRFIDReader() {
  serial.list(function(err, results) {
    console.log("Found", results.length, "potential serial ports.");
  });
  
  rfidreader.init(config['rfidreader-port'], function() {
    console.log("Connection to RFID reader opened.");
  }, function(data) {
    console.log("Data by RFID reader:", data);
  });
}

/**
 * The main application entry point.
 * */
function main() {
  initRFIDReader();
  startWeb();
}
main();
