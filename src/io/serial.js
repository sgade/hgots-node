/**
 * A general serial port helper.
 * @module io/serial
 * @author Sören Gade
 * */
 
/**
 * A callback that only contains an error object.
 * @callback Callback
 * @param {Exception} err - The exception that was raised or null.
 * @param {Object} data - The resulting data. May be anything. Only set if err is null.
 * */

var assert = require('assert');
var util = require('util');
var events = require('events');
var serialport = require('serialport');

/**
 * Lists all serial ports found on the device.
 * @param {Callback} callback - A callback that is called upon finish or error.
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
    var self = this;
    // add event listener
    self.serialPort.on('data', function(data) {
      _onData.call(self, data);
    });
    
    /**
     * Open event.
     * @event Serial#open
     * @type {Error}
     * */
    self.emit('open', err);
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
      return callback(new Error("Serial port is already open."));
    }
    
    self.serialPort.open(function(err) {
      if ( !!err ) {
        return callback(err);
      }
      
      self.isOpen = true;
      
      // call callbacks
      callback(err);
      _onOpen.call(self, err);
    });
  };
  
  this.close = function(callback) {
    var self = this;
    callback = callback || function() {};
    
    if ( !self.isOpen ) {
      return callback(new Error("Serial port is already closed."));
    }
    
    self.serialPort.close(function(err) {
      if ( !!err ) {
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
   * @param {Callback} callback
   * */
  this.write = function(buffer, callback) {
    var self = this;
    callback = callback || function() {};
    
    if ( !self.isOpen ) {
      return callback(new Error("Serial port is closed."));
    }
    
    self.serialPort.write(buffer, function(err) {
      // call callbacks
      callback(err, buffer);
      _onWritten.call(self, err, buffer);
    });
  };
  
  /* ==========
   * Construct
   * ==========
   * */
  events.EventEmitter.call(this);
  options = _combineProperties(SERIAL_OPTIONS, options);
  this.serialPort = new SerialPort(port, options, false);
  
  // checks
  assert(port !== '/dev/null', "Caution: Do not use /dev/null for serial ports!");
}
// inherit for events
util.inherits(Serial, events.EventEmitter);

module.exports.Serial = Serial;
