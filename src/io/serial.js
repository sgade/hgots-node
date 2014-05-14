/**
 * A general serial port helper.
 * @module io/serial
 * @author Sören Gade
 * */

var assert = require('assert');
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
 * Serial Class implementation
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

/**
 * A serial port base class with defaults.
 * @constructor
 * @extends events.EventEmitter
 * */
function Serial(port, options) {
  /**
   * The serial port connection.
   * @instance
   * */
  this.serialPort = null;
  /**
   * Whether the connection should be open.
   * @instance
   * */
  this.isOpen = false;
  
  /* ==========
   * Privates
   * ==========
   * */
  var _combineProperties = function(object1, object2) {
    var object = {};
    // checks for objects
    if ( typeof object1 !== 'object' || typeof object2 !== 'object' ) {
      if ( typeof object1 === 'object' ) {
        return object1;
      } else if ( typeof object2 === 'object' ) {
        return object2;
      } else {
        return object;
      }
    }
    
    for ( var attr1 in object1 ) {
      object[attr1] = object1[attr1];
    }
    for ( var attr2 in object2 ) {
      object[attr2] = object2[attr2];
    }
    
    return object;
  };
  /**
   * A function that should be called once we have openend the serial port.
   * @fires Serial#open
   * */
  var _onOpen = function(err) {
    /**
     * Open event.
     * @event Serial#open
     * @type {Error}
     * */
    this.emit('open', err);
  };
  var _onClose = function(err) {
    /**
     * Close event.
     * @event Serial#close
     * @type {Error}
     * */
    this.emit('close', err);
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
  var _onWritten = function(err, buffer) {
    /**
     * Written event.
     * @event Serial#written
     * @type {Object}
     * @param {Error} err
     * @param {Buffer} buffer
     * */
    this.emit('written', {
      err: err,
      buffer: buffer
    });
  };
  
  /* ==========
   * Public
   * ==========
   * */
  this.open = function(callback) {
    var self = this;
    callback = callback || function() {};
    
    if ( self.isOpen ) {
      return callback();
    }
    
    self.serialPort.open(function(err) {
      if ( err ) {
        // let dev happen without
        if ( process.env.NODE_ENV === 'production' ) {
          throw err; // TODO: handle error
        }
        return callback(err);
      }
      
      self.isOpen = true;
      
      // call callbacks
      callback();
      _onOpen.call(self, err);
      // add handler
      self.serialPort.on('data', function(data) {
        _onData.call(self, data);
      });
    });
  };
  
  this.close = function(callback) {
    var self = this;
    callback = callback || function() {};
    
    if ( !self.isOpen ) {
      return callback();
    }
    
    self.serialPort.close(function(err) {
      if ( err ) {
        throw err; // TODO: handle error
      }
      
      self.isOpen = false;
      
      // call callbacks
      callback(err);
      _onClose.call(self, err);
    });
  };
  /**
   * Writes the data to the serial port.
   * @param {Buffer} buffer
   * @param {ErrorSuccessCallback} callback
   * */
  this.write = function(buffer, callback) {
    var self = this;
    callback = callback || function() {};
    
    if ( !self.isOpen ) {
      return callback();
    }
    
    self.serialPort.write(buffer, function(err) {
      _onWritten.call(self, err, buffer);
      
      callback(err);
    });
  };
  
  /* ==========
   * Construct
   * ==========
   * */
  events.EventEmitter.call(this);
  options = _combineProperties(SERIAL_OPTIONS, options);
  this.serialPort = new SerialPort(port, SERIAL_OPTIONS, false);
  
  // checks
  assert(port !== '/dev/null', "Caution: Do not use /dev/null for serial ports!");
}
// inherit for events
util.inherits(Serial, events.EventEmitter);

module.exports.Serial = Serial;

/**
 * A callback that only contains an error object.
 * @callback ErrorCallback
 * @param {Exception} err - Is an error object or null.
 * */
