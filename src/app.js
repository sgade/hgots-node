/**
 * Main application module.
 * Project started: 16.03.2014 - 00:21
 * @module app
 * @author Sören Gade
 *
 * @requires config
 * @requires web/index
 * @requires io/rfidreader
 * */

var config = require('./config');
var web = require('./web/');
var RFIDReader = require('./io/rfidreader');

console.log("Hello World!");
console.log("This is going to be a full featured door lock system.");
/* ==========
 * Globals
 * ==========
 * */
var rfidReader = null;

/* ==========
 * Init
 * ==========
 * */
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
  var port = config['rfidreader-port'];
  
  // create new instance
  rfidReader = new RFIDReader(port);
  
  // add event listeners
  rfidReader.on('data', function(data) {
    console.log("Data by RFID reader:", data);
  });
  
  // open connection
  rfidReader.open(function() {
    console.log("Connection to RFID reader opened.");
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
