/**
 * The RFID Reader communication module.
 * @module io/rfidreader
 * @author Sören Gade
 *
 * @requires serialport
 * */

var serialport = require('serialport');
var SerialPort = serialport.SerialPort;

var NEWLINE = '\n';

var serialPort = null;

/**
 * Initalizes the module on the port defined.
 * @param {String} port - The path/name of the port to be opened.
 * */
exports.init = function(port, openCallback, dataCallback) {
  init(port, openCallback, dataCallback);
};

function init(port, openCallback, dataCallback) {
  serialPort = new SerialPort(port, {
    parser: serialport.parsers.readline(NEWLINE)
  }, false);
  
  serialPort.open(function() {
    openCallback();
    
    serialPort.on('data', function(data) {
      dataCallback(data);
    });
    
  });
}

/**
 * A callback that only contains an error object.
 * @callback ErrorCallback
 * @param {Exception} err - Is an error object or null.
 * */
/**
 * @param {Buffer} buffer - The buffer to write.
 * @param {ErrorCallback} callback - The callback.
 * */
exports.write = function(buffer, callback) {
  serialPort.write(buffer, callback);
};
