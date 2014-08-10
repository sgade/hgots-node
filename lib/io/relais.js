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
  this.relaisID = 0;
  
  // our custom parser
  // emit after 4 bytes each
  SERIAL_OPTIONS.parser = (function() {
    var blockSize = 4;
    var data = new Buffer(0);
    
    return function(emitter, buffer) {
      // new tmp buffer
      var newData = new Buffer(data.length + buffer.length);
      // copy old data into it
      data.copy(newData, 0, 0, data.length);
      // append new buffer data
      buffer.copy(newData, data.length, 0, buffer.length);
      // set new buffer to old variable
      data = newData;
      
      // get number of parts that will be emitted
      var numParts = data.length / blockSize;
      // get number of bytes that will stay until new data arrives
      var numRest = data.length % blockSize;
      
      // break up data into parts
      var parts = [];
      for ( var i = 0; i < numParts; i++ ) {
        // a part
        var buf = new Buffer(blockSize);
        // copy a certain part into the array
        data.copy(buf, 0, i * blockSize, i * blockSize + blockSize);
        
        parts.push(buf);
      }
      if ( numRest <= 0 ) {
        // we do not have anything left: 0
        data = new Buffer(0);
      } else {
        // we do have something left: make buffer and copy that.
        var tmp = new Buffer(numRest);
        data.copy(tmp, 0, data.length - 1 - numRest, data.length - 1);
        data = tmp;
      }
      
      // emit each part as separate message
      parts.forEach(function(bufferPart) {
        emitter.emit('data', bufferPart);
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
    delay = ( delay > 0 ) ? delay : 0;
    callback = callback || function() {};
  
    if ( delay === 0 ) {
      relaisOperation.call(self, self.getAllRelais(), callback);
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
          callback(err);
          throw err;
        }
        // done
        callback(null);
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
   * @param {byte} [data]
   * @param {Callback} callback - Callback for Relais#write (Error) and Relais#read (Result).
   * */
  this.send = function(command, data, callback) {
    var self = this;
    if ( !callback ) {
      if ( typeof data === "function" ) {
        callback = data;
        data = 0;
      } else {
        callback = function() {};
      }
    }
    
    if ( !self.isOpen ) {
      return callback(new Error('Relais port is closed.'));
    }
  
    var buffer = new Buffer(4);
    buffer[RelaisByteNames.Command] = command;
    buffer[RelaisByteNames.Address] = self.relaisID;
    buffer[RelaisByteNames.DataByte] = data;
    buffer[RelaisByteNames.CheckSum] = ( command ^ self.relaisID ^ data );
  
    // call callback after write
    var dataCheck = function(data) {
      if ( typeof data !== "object" ) { // should be "Buffer"
        throw new Error("Invalid response data from relais card:" + data);
      }
      
      var responseCommand = data[RelaisByteNames.Command];
      var responseAddress = data[RelaisByteNames.Address];
      if ( responseCommand === 255 ) { // error
        var err1 = new Error("Error from Relais card " + responseAddress + ".");
        return callback(err1);
      }
      if ( responseCommand === 1 ) { // setup for other relais cards
        self.serialPort.once('data', dataCheck);
        // ignore
        return;
      }
      
      if ( responseCommand !== ( 255 - command ) ) {
        var err2 = new Error("Invalid response command. Expected " + ( 255 - command ) + " got " + responseCommand);
        return callback(err2);
      }
      
      // only call into our other code after some time because execution of other relais commands
      // may overload the card an cause errors (255)
      // 10 ms seems to be a good time, for both users and relais card itself
      setTimeout(function() {
        callback(null, data);
      }, 10);
    };
    self.serialPort.once('data', dataCheck);
  
    return self.write(buffer, function(err) {
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
   * @param {Callback} [callback]
   * */
  this.noOperation = function(callback) {
    var self = this;
    callback = callback || function() {};
  
    return self.send(Commands.NoOperation, function(err, data) {
      if ( !!err ) {
        return callback(err);
      }
      
      var ok = ( data[RelaisByteNames.Command] === 255 );
      return callback(err, ok);
      
    });
  };
  /**
   * @param {Callback} [callback]
   * */
  this.NOP = function(callback) {
    return this.noOperation(callback);
  };

  /**
   * @param {Callback} [callback]
   * */
  this.setup = function(callback) {
    var self = this;
    callback = callback || function() {};
    
    if ( self.relaisID !== 0 ) {
      return callback(new Error("Relais ID is already set to", self.relaisID));
    }
    
    // relais ID should be send to 0x01
    self.relaisID = 0x01;
    
    return self.send(Commands.Setup, function(err, data) {
      if ( !!err ) {
        return callback(err);
      }
      
      // set relais id according to response from relais card
      self.relaisID = data[RelaisByteNames.Address];
      
      return callback(err, true);
      
    });
  };

  /**
   * @param {Callback} [callback]
   * */
  this.getPort = function(callback) {
    var self = this;
    callback = callback || function() {};
  
    return self.send(Commands.GetPort, function(err, data) {
      if ( !!err ) {
        return callback(err);
      }
      
      var port = data[RelaisByteNames.DataByte];
      
      return callback(err, port);
      
    });
  };

  /**
   * @param {byte} relais
   * */
  this.setPort = function(relais, callback) {
    return this.send(Commands.SetPort, relais, callback);
  };

  /**
   * @param {Callback} [callback]
   * */
  this.getOption = function(callback) {
    var self = this;
    callback = callback || function() {};
    
    return self.send(Commands.GetOption, function(err, data) {
      if ( !!err ) {
        return callback(err);
      }
        
      var dataByte = data[RelaisByteNames.DataByte];
      return callback(err, dataByte);
      
    });
  };

  /**
   * @param {byte} option
   * */
  this.setOption = function(option, callback) {
    return this.send(Commands.SetOption, option, callback);
  };

  /**
   * @param {byte} relais
   * @param {Callback} [callback]
   * */
  this.setSingle = function(relais, callback) {
    var self = this;
    callback = callback || function() {};
  
    return self.send(Commands.SetSingle, relais, function(err, data) {
      if ( !!err ) {
        return callback(err);
      }
      
      var single = data[RelaisByteNames.DataByte];
      return callback(err, single);
      
    });
  };

  /**
   * @param {byte} relais
   * @param {Callback} [callback]
   * */
  this.delSingle = function(relais, callback) {
    var self = this;
    callback = callback || function() {};
  
    self.send(Commands.DelSingle, relais, function(err, data) {
      if ( !!err ) {
        return callback(err);
      }
      
      var single = data[RelaisByteNames.DataByte];
      return callback(err, single);
      
    });
  };

  /**
   * @param {byte} relais
   * @param {Callback} [callback]
   * */
  this.toggle = function(relais, callback) {
    var self = this;
    callback = callback || function() {};
  
    self.send(Commands.Toggle, relais, function(err, data) {
      if ( !!err ) {
        return callback(err);
      }
      
      var resp = data[RelaisByteNames.DataByte];
      return callback(err, resp);
      
    });
  };

  /**
   * @param {int} delay
   * @param {Callback} [callback]
   * */
  this.activateAll = function(delay, callback) {
    return _iterateAllRelais.call(this, delay, this.setSingle, callback);
  };

  /**
   * @param {int} delay
   * @param {Callback} [callback]
   * */
  this.deactivateAll = function(delay, callback) {
    return _iterateAllRelais.call(this, delay, this.delSingle, callback);
  };
}
util.inherits(Relais, Serial);

module.exports = Relais;
