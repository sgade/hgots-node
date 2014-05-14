/**
 * The Relais card communication protocol implementation.
 * Taken from my old "Relais.cs".
 * @module io/relais
 * @author Sören Gade
 *
 * @requires serialport
 * */

/**
 * A callback that simly indicated whether a certain task was successful.
 * @callback SuccessCallback
 * @param {bool} success
 * */
 
var util = require('util');
var async = require('async');
var Serial = require('./serial').Serial;

/**
 * Options for the serial port.
 * @constant
 * @type {Object}
 * @default
 * */
var SERIAL_OPTIONS = {
  baudrate: 19200,
  databits: 8,
  stopbits: 1,
  parity: 'none'
};
/**
 * Commands the Relais card understands.
 * @constant
 * @type {Object}
 * @default
 * */
var Commands = {
  NoOperation: 0,
  Setup: 1,
  GetPort: 2,
  SetPort: 3,
  Getption: 4,
  SetOption: 5,
  SetSingle: 6,
  DelSingle: 7,
  Toggle: 8
};
/**
 * Relais can be identified via a certain byte. These are there values.
 * @constant
 * @type {Object}
 * @default
 * */
var RelaisByteCount = {
  One: 1,
  Two: 2,
  Three: 4,
  Four: 8,
  Five: 16,
  Six: 32,
  Seven: 64,
  Eight: 128
};
/**
 * Name for the part of the messages send between us and the relais card.
 * @constant
 * @type {Object}
 * @default
 * */
var RelaisByteNames = {
  Command: 0,
  Address: 1,
  DataByte: 2,
  CheckSum: 3
};

/**
 * @constructor
 * @extends events.EventEmitter
 * */
function Relais(port) {
  /**
   * The id our card has.
   * @instance
   * */
  var relaisID = 0;
  
  // our custom parser
  // emit after 4 bytes each
  SERIAL_OPTIONS.parser = (function() {
    var data = "";
    
    return function(emitter, buffer) {
      data += buffer.toString();
      
      var parts = data.match(/.{1,4}/g);
      data = parts.pop();
      parts.forEach(function(part) {
        emitter.emit('data', part);
      });
    };
    
  }());
  Serial.call(this, port, SERIAL_OPTIONS);
  
  /* ==========
   * PRIVATE
   * ==========
   * */
  /**
   * @param {uint} delay
   * @param {Function} relaisOperation - An operation that is passed a relais number that it should work on.
   * @param {Callback} callback
   * */
  var _iterateAllRelais = function(delay, relaisOperation, callback) {
    var self = this;
    if ( !delay ) {
      delay = 0;
    }
    callback = callback || function() {};
  
    if ( delay === 0 ) {
      relaisOperation.call(self, self.getAllRelais());
    } else {
      var relaisNums = [ 1, 2, 4, 8, 16, 32, 64, 128 ];
    
      async.eachSeries(relaisNums, function(item, cb) {
      
        // item == relaisnum
        relaisOperation.call(self, item);
      
        setTimeout(function() {
          cb();
        }, delay);
      
      }, function(err) {
        if ( err ) {
          throw err;
        }
        // done
        callback();
      });
    
    }
  };
  
  /* ==========
   * PUBLIC
   * ==========
   * */
  /*
   * Disclaimer:
   * Ported directly from old .cs source file:
   * | | | | | | | | | | | | | | | | | | | | |
   * | | | | | | | | | | | | | | | | | | | | |
   * v v v v v v v v v v v v v v v v v v v v v
   * */
  /**
   * @param {byte} command
   * @param {byte} data
   * @param {ErrorResultCallback} callback - Callback for Relais#write (Error) and Relais#read (Result).
   * */
  this.send = function(command, data, callback) {
    var self = this;
    callback = callback || function() {};
    
    if ( !this.isOpen ) {
      return callback(null, new Array(4));
    }
  
    var buffer = new Array(4);
    buffer[RelaisByteNames.Command] = command;
    buffer[RelaisByteNames.Address] = self.relaisID;
    buffer[RelaisByteNames.DataByte] = data;
    buffer[RelaisByteNames.CheckSum] = ( command ^ self.relaisID ^ data );
  
    // call callback after write
    self.serialPort.once('data', function(data) {
      // TODO: maybe validate the data, use ArrayBuffer or similar
      data = data.toString();
      data = data.match(/.{1,1}/g);
    
      callback(null, data);
    });
  
    self.write(buffer, function(err) {
      if ( err ) {
        callback(err);
      }
    });
  };
  
  this.getMoreRelais = function(relais1, relais2, relais3, relais4, relais5, relais6, relais7, relais8) {
    var retVal = ( RelaisByteCount.One * relais1 );
    retVal += ( RelaisByteCount.Two * relais2 );
    retVal += ( RelaisByteCount.Three * relais3 );
    retVal += ( RelaisByteCount.Four * relais4 );
    retVal += ( RelaisByteCount.Five * relais5 );
    retVal += ( RelaisByteCount.Six * relais6 );
    retVal += ( RelaisByteCount.Seven * relais7 );
    retVal += ( RelaisByteCount.Eight * relais8 );
  
    return retVal;
  };
  this.getAllRelais = function() {
    return this.getMoreRelais(1, 1, 1, 1, 1, 1, 1, 1);
  };
  
  /**
   * @param {SuccessCallback} callback
   * */
  this.noOperation = function(callback) {
    var self = this;
    callback = callback || function() {};
  
    self.send(Commands.NoOperation, 0, function(err, data) {
      if ( err ) {
        callback(false);
      } else {
      
        var ok = ( data[RelaisByteNames.Command] === 255 );
        callback(ok);
      
      }
    });
  };
  /**
   * @param {SuccessCallback} callback
   * */
  this.NOP = function(callback) {
    this.noOperation(callback);
  };

  /**
   * @param {SuccessCallback} callback
   * */
  this.setup = function(callback) {
    var self = this;
    callback = callback || function() {};
  
    if ( self.relaisID === 0 ) {
      self.send(Commands.Setup, 0, function(err, data) {
        if ( err ) {
          callback(false);
        } else {
       
          if ( data[RelaisByteNames.Command] === ( 255 - Commands.Setup ) ) {
            self.relaisID = data[RelaisByteNames.Address];
        
            callback(true);
          }
        
        }
      });
    } else {
      callback(false);
    }
  };

  /**
   * @param {ErrorResultCallback}
   * */
  this.getPort = function(callback) {
    var self = this;
    callback = callback || function() {};
  
    self.send(Commands.GetPort, 0, function(err, data) {
      if ( err ) {
        callback(err);
      } else {
     
        if ( data[RelaisByteNames.Command] === ( 255 - Commands.GetPort ) ) {
          var port = data[RelaisByteNames.DataByte];
          callback(null, port);
        } else {
          callback(null, 0);
        }
      
      }
    });
  };

  /**
   * @param {byte} relais
   * */
  this.setPort = function(relais) {
    this.send(Commands.SetPort, relais);
  };

  /**
   * @param {ErrorResultCallback} callback
   * */
  this.getOption = function(callback) {
    var self = this;
    callback = callback || function() {};
  
    self.send(Commands.GetOption, 0, function(err, data) {
      if ( err ) {
        callback(err);
      } else {
      
        if ( data[RelaisByteNames.Command] === ( 255 - Commands.GetOption) ) {
          var dataByte = data[RelaisByteNames.DataByte];
          callback(null, dataByte);
        } else {
          callback(null, 0);
        }
      
      }
    });
  };

  /**
   * @param {byte} option
   * */
  this.setOption = function(option) {
    this.send(Commands.SetOption, option);
  };

  /**
   * @param {byte} relais
   * @param {ErrorResultCallback} callback
   * */
  this.setSingle = function(relais, callback) {
    var self = this;
    callback = callback || function() {};
  
    self.send(Commands.SetSingle, relais, function(err, data) {
      if ( err ) {
        callback(err);
      } else {
      
        if ( data[RelaisByteNames.Command] === ( 255 - Commands.SetSingle ) ) {
          var single = data[RelaisByteNames.DataByte];
          callback(null, single);
        } else {
          callback(null, 0);
        }
      
      }
    });
  };

  /**
   * @param {byte} relais
   * @param {ErrorResultCallback} callback
   * */
  this.delSingle = function(relais, callback) {
    var self = this;
    callback = callback || function() {};
  
    self.send(Commands.DelSingle, relais, function(err, data) {
      if ( err ) {
        callback(err);
      } else {
      
        if ( data[RelaisByteNames.Command] === ( 255 - Commands.DelSingle ) ) {
          var single = data[RelaisByteNames.DataByte];
          callback(null, single);
        } else {
          callback(null, 0);
        }
      
      }
    });
  };

  /**
   * @param {byte} relais
   * @param {ErrorResultCallback} callback
   * */
  this.toggle = function(relais, callback) {
    var self = this;
    callback = callback || function() {};
  
    self.send(Commands.Toggle, relais, function(err, data) {
      if ( err ) {
        callback(err);
      } else {
      
        if ( data[RelaisByteNames.Command] === ( 255 - Commands.Toggle ) ) {
          var resp = data[RelaisByteNames.DataByte];
          callback(null, resp);
        } else {
          callback(null, 0);
        }
      
      }
    });
  };

  /**
   * @param {int} delay
   * @param {Callback} callback
   * */
  this.activateAll = function(delay, callback) {
    _iterateAllRelais.call(this, delay, this.setSingle, callback);
  };

  /**
   * @param {int} delay
   * @param {Callback} callback
   * */
  this.deactivateAll = function(delay, callback) {
    _iterateAllRelais.call(this, delay, this.delSingle, callback);
  };
}
util.inherits(Relais, Serial);

module.exports = Relais;
