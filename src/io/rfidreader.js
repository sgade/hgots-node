/**
 * The RFID Reader communication module.
 * @module io/rfidreader
 * @author Sören Gade
 *
 * @requires serialport
 * */

var util = require('util');
var events = require('events');
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
var RFIDReader = function(port) {
  /* ==========
   * Members
   * ==========
   * */
  /**
   * The serial port class instance.
   * @instance
   * */
  var serialPort = null;
  
  /* ==========
   * Construct
   * ==========
   * */
  events.EventEmitter.call(this);
  this.serialPort = new SerialPort(port, {
    parser: serialport.parsers.readline(NEWLINE)
  }, false);
  
  /* ==========
   * Privates
   * ==========
   * */
  /**
   * A function that should be called once we have openend the serial port.
   * @fires RFIDReader#open
   * */
  var _onOpen = function() {
    /**
     * Open event.
     * @event RFIDReader#open
     * */
    this.emit('open');
  };
  /**
   * A function that should be called once we have received data from our serial port.
   * @param {Buffer} data - The data that was read.
   * @fires RFIDReader#data
   * */
  var _onData = function(data) {
    /**
     * Data event.
     * @event RFIDReader#data
     * @type {Buffer}
     * */
    this.emit('data', data);
  };
  /**
   * A function that should be called after we have written our buffer to the serial port.
   * @param {Exception} err - The error object we may have obtained.
   * @fires RFIDReader#written
   * */
  var _onWritten = function(err) {
    /**
     * Written event.
     * @event RFIDReader#written
     * @type {Exception}
     * */
    this.emit('written', err);
  };
  
  /* ==========
   * Publics
   * ==========
   * */
  /**
   * Opens the serial port connection via the port specified in the constructor.
   * @param {Callback} callback - A callback that is called upon finish.
   * */
  this.open = function(callback) {
    var self = this;
  
    self.serialPort.open(function() {
      if ( callback )
        callback();
      _onOpen.call(self);
    
      self.serialPort.on('data', function(data) {
        _onData.call(self, data);
      });
    });
  };

  /**
   * @param {Buffer} buffer - The buffer to write.
   * @param {ErrorCallback} [callback] - The callback.
   * */
  this.write = function(buffer, callback) {
    var self = this;
  
    self.serialPort.write(buffer, function(err) {
      if ( callback )
        callback();
      _onWritten.call(self, err);
    });
  };
};
// inherit for events
util.inherits(RFIDReader, events.EventEmitter);

module.exports = RFIDReader;

/**
 * A callback that only contains an error object.
 * @callback ErrorCallback
 * @param {Exception} err - Is an error object or null.
 * */
