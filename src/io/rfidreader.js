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
 * Options for the serial port.
 * @constant
 * @type {Object}
 * @default
 * */
var SERIAL_OPTIONS = {
  baudrate: 9600,
  databits: 8,
  stopbits: 1,
  parity: 'none'
};

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
  
  var isOpen = false;
  
  /* ==========
   * Construct
   * ==========
   * */
  events.EventEmitter.call(this);
  var options = SERIAL_OPTIONS;
  options.parser = serialport.parsers.readline(NEWLINE);
  this.serialPort = new SerialPort(port, options, false);
  
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
  var _onClose = function() {
    this.emit('close');
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
  
  /* ==========
   * Publics
   * ==========
   * */
  this.isOpen = function() {
    return this.isOpen;
  };
  
  /**
   * Opens the serial port connection via the port specified in the constructor.
   * @param {Callback} callback - A callback that is called upon finish.
   * */
  this.open = function(callback) {
    var self = this;
    if ( !callback ) {
      callback = function() {};
    }
    
    if ( this.isOpen ) {
      callback();
      return;
    }
  
    self.serialPort.open(function(err) {
      if ( err ) {
        throw err; // TODO handle error
      }
      
      callback(err);
      _onOpen.call(self);
    
      self.serialPort.on('data', function(data) {
        _onData.call(self, data);
      });
    });
  };
  
  this.close = function(callback) {
    var self = this;
    if ( !callback ) {
      callback = function() {};
    }
    
    if ( this.isOpen ) {
      self.serialPort.close(function(err) {
        callback(err);
        
        _onClose.call(self);
      });
    } else {
      callback();
    }
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
