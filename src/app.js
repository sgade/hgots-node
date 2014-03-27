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

require('./log-replace')();
var config = require('./config');
var web = require('./web/');
var RFIDReader = require('./io/rfidreader');
var Relais = require('./io/relais');
var db = require('./db/');

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
  var port = config.web.port;
  
  if(typeof PhusionPassenger !== 'undefined') {
    PhusionPassenger.configure({ autoInstall: false });
    port = 'passenger';
  }
  
  web.init(port, web_RFIDRequest, web_OpenDoor, function() {
    web.start(function() {
      console.log("Web interface running on port " + web.getPort() + ".");
    });
  });
}
function web_RFIDRequest(callback) {
  rfidReader.on('data', function(data) {
    callback(data);
  });
}
function web_OpenDoor(callback) {
  // TODO relais.setSingle on door relais
  console.log("Open door...");
  
  relais.setSingle(config.relaisport.door, function() {
    setTimeout(function() {
      relais.delSingle(config.relaisport.door, function() {
        console.log("door closed.");
        callback();
      });
    }, config.web.doorOpenTime);
  });
}

/**
 * Initializes the connection with the RFID reader.
 * */
function initRFIDReader() {
  var port = config.port.rfid;
  if ( !port ) {
    console.log("Please set the rfidreader port in the config.");
    return;
  }
  
  // create new instance
  rfidReader = new RFIDReader(port);
  
  // add event listeners
  rfidReader.on('data', function(data) {
    data = data.toString();
    console.log("Data by RFID reader:", data);
    
    db.Card.find({
      where: {
        uid: data
      }
    }).success(function(card) {
      if ( !card ) {
        console.log("no card found.");
      } else {
        console.log("Card found.");
        card.getUser().success(function(user) {
          if ( !user ) {
            console.log("no user found");
          } else {
            console.log("user is", user.username);
          }
        });
      }
    });
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
  var port = config.port.relais;
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

if ( !module.parent || typeof PhusionPassenger !== 'undefined') {
  /**
   * The main application entry point.
   * */
  (function main() {
    initRFIDReader();
    initRelais();
    startWeb();
  }());
}

function exit(err) {
  if ( err ) {
    console.log("Unhandled Error:", err.stack);
  } else {
    console.log("Exiting...");
  }
  if ( rfidReader.isOpen() ) {
    rfidReader.close();
  }
  if ( relais.isOpen() ) {
    relais.close();
  }
  
  web.stop();
  
  // Done
  console.log("Bye!");
  // won't exit otherwise
  process.kill();
}
process.on('exit', exit);
process.on('SIGINT', exit);
process.on('uncaughtException', exit);
