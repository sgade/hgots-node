/**
 * A general serial port helper.
 * @module io/serial
 * @author Sören Gade
 *
 * @requires serialport
 * */

var util = require('util');
var events = require('events');
var serialport = require('serialport');

/**
 * A callback that is called with two parameters.
 * @callback ErrorResultCallback
 * @param {Exception} err - Is an error object or null.
 * @param {Object} object - The resulting data.
 * */
/**
 * Lists all serial ports found on the device.
 * @param {ErrorResultCallback} callback - A callback that is called upon finish or error.
 * */
exports.list = function(callback) {
  serialport.list(callback);
};

/* ==========
 * Serial Class
 * ==========
 * */
var SerialPort = serialport.SerialPort;

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

function Serial(port, options) {
  this.serialPort = null;
  this.isOpen = false;
  
  events.EventEmitter.call(this);
  // TODO merge objects
  this.serialPort = new SerialPort(port, SERIAL_OPTIONS, false);
  
  /* ==========
   * Privates
   * ==========
   * */
  /**
   * A function that should be called once we have openend the serial port.
   * @fires Serial#open
   * */
  var _onOpen = function() {
    /**
     * Open event.
     * @event Serial#open
     * */
    this.emit('open');
  };
  var _onClose = function() {
    /**
     * Close event.
     * @event Serial#close
     * */
    this.emit('close');
  };
  /**
   * A function that should be called once we have received data from our serial port.
   * @param {Buffer} data - The data that was read.
   * @fires Serial#data
   * */
  var _onData = function(data) {
    /**
     * Data event.
     * @event Serial#data
     * @type {Buffer}
     * */
    this.emit('data', data);
  };
  
  /* ==========
   * Public
   * ==========
   * */
  this.open = function(callback) {
    var self = this;
    callback = callback || function() {};
    
    if ( this.isOpen ) {
      return callback();
    }
    
    self.serialPort.open(function(err) {
      if ( err ) {
        throw err; // TODO handle error
      }
      
      _onOpen.call(self);
      self.serialPort.on('data', function(data) {
        _onData.call(self, data);
      });
    });
  };
  
  this.close = function(callback) {
    var self = this;
    callback = callback || function() {};
    
    if ( !this.isOpen ) {
      return callback();
    }
    
    self.serialPort.close(function(err) {
      if ( err ) {
        throw err; // TODO handle error
      }
      
      callback(err);
      _onClose.call(self);
    });
  };
};
// inherit for events
util.inherits(Serial, events.EventEmitter);

module.exports.Serial = Serial;

