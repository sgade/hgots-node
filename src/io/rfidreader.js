/**
 * The RFID Reader communication module.
 * @module io/rfidreader
 * @author Sören Gade
 *
 * @requires serialport
 * */

var util = require('util');
var Serial = require('./serial').Serial;
var serialport = require('serialport');
var SerialPort = serialport.SerialPort;

/**
 * The newline separator that should be used to determine input ends by the rfid reader.
 * @constant
 * @type {String}
 * @default
 * */
var NEWLINE = '\n';

/**
 * Initalizes the class on the port defined.
 * @constructor RFIDReader
 * @extends events.EventEmitter
 * @param {String} port - The path/name of the port to be opened.
 * */
var RFIDReader = function(port, options) {
  /* ==========
   * Construct
   * ==========
   * */
  options = options || {};
  options.parser = options.parser || serialport.parsers.readline(NEWLINE);
  Serial.call(this, port, options);
};
// inherit for serial handling
util.inherits(RFIDReader, Serial);

module.exports = RFIDReader;

/**
 * A callback that only contains an error object.
 * @callback ErrorCallback
 * @param {Exception} err - Is an error object or null.
 * */
