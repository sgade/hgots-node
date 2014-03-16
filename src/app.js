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
var Relais = require('./io/relais');

console.log("Hello World!");
console.log("This is going to be a full featured door lock system.");
/* ==========
 * Globals
 * ==========
 * */
var rfidReader = null;
var relais = null;

/* ==========
 * Init
 * ==========
 * */
/**
 * Starts the webserver.
 * */
function startWeb() {
  var port = config["web-port"];
  
  web.init(port, web_RFIDRequest);
  web.start(function() {
    console.log("Web interface running on port " + web.getPort() + ".");
  });
}
function web_RFIDRequest(callback) {
  rfidReader.on('data', function(data) {
    callback(data);
  });
}

/**
 * Initializes the connection with the RFID reader.
 * */
function initRFIDReader() {
  var port = config['rfidreader-port'];
  if ( !port ) {
    console.log("Please set the rfidreader port in the config.");
    return;
  }
  
  // create new instance
  rfidReader = new RFIDReader(port);
  
  // add event listeners
  rfidReader.on('data', function(data) {
    console.log("Data by RFID reader:", data);
  });
  
  // open connection
  rfidReader.open(function() {
    console.log("Connection to RFID reader opened (" + port + ").");
  });
}
/**
 * Initializes the connection with the relais card.
 * */
function initRelais() {
  var port = config["relais-port"];
  if ( !port ) {
    console.log("Please set the relais card port in the config.");
    return;
  }
  
  relais = new Relais(port);
  
  relais.open(function() {
    console.log("Connection to relais card opened (" + port + ").");
    
    relais.deactivateAll();
  });
}

/**
 * The main application entry point.
 * */
function main() {
  initRFIDReader();
  initRelais();
  startWeb();
}
main();
