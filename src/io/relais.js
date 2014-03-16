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
var events = require('events');
var async = require('async');
var serialport = require('serialport');
var SerialPort = serialport.SerialPort;

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
   * @instance
   * */ 
  var serialPort = null;
  /**
   * @instance
   * */
  var relaisID = 0;
  /**
   * @instance
   * */
  var isOpen = false;
  
  this.serialPort = new SerialPort(port, SERIAL_OPTIONS, false);
}
util.inherits(Relais, events.EventEmitter);

Relais.prototype.open = function(callback) {
  var self = this;
  
  self.serialPort.open(function() {
    self.isOpen = true;
    
    if ( callback ) {
      callback();
    }
    self.emit('open');
  });
};

/*
 * Disclaimer:
 * Ported directly from old .cs source file:
 * | | | | | | | | | | | | | | | | | | | | |
 * | | | | | | | | | | | | | | | | | | | | |
 * v v v v v v v v v v v v v v v v v v v v v
 * */

Relais.prototype.writeOK = function() {
  return this.isOpen;
};
/**
 * Writes the buffer to the serial port.
 * @param {Buffer} buffer - The buffer to write.
 * @param {ErrorCallback} [callback] - The callback that is called upon finish. Data might not be flushed at that point.
 *
 * {@link https://github.com/voodootikigod/node-serialport#write-buffer-callback}
 * @fires Relais#written
 * */
Relais.prototype.write = function(buffer, callback) {
  var self = this;
  
  if ( self.writeOK() ) {
    self.serialPort.write(buffer, function(err) {
      if ( callback ) {
        callback(err);
      }
      /**
       * Written event.
       * @event Relais#written
       * @type {Object}
       * @param {Buffer} buffer
       * @param {Exception} err
       * */
      self.emit('written', {
        buffer: buffer,
        err: err
      });
    });
  }
};

/**
 * @param {byte} command
 * @param {byte} data
 * @param {ErrorResultCallback} callback - Callback for Relais#write (Error) and Relais#read (Result).
 * */
Relais.prototype.send = function(command, data, callback) {
  if ( !this.writeOK() ) {
    return;
  }
  var self = this;
  
  var buffer = new Array(4);
  buffer[RelaisByteNames.Command] = command;
  buffer[RelaisByteNames.Address] = self.relaisID;
  buffer[RelaisByteNames.DataByte] = data;
  buffer[RelaisByteNames.CheckSum] = ( command ^ self.relaisID ^ data );
  
  // call callback after write
  if ( callback ) {
    self.serialPort.once('data', function(dat) {
      if ( callback ) {
        callback(null, data);
      }
    });
  }
  
  self.write(buffer, function(err) {
    if ( err ) {
      if ( callback ) {
        callback(err);
      }
    }
  });
};

Relais.prototype.getMoreRelais = function(relais1, relais2, relais3, relais4, relais5, relais6, relais7, relais8) {
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
Relais.prototype.getAllRelais = function() {
  return this.getMoreRelais(1, 1, 1, 1, 1, 1, 1, 1);
};

/**
 * @param {SuccessCallback} callback
 * */
Relais.prototype.noOperation = function(callback) {
  var self = this;
  if ( !callback ) {
    callback = function() {};
  }
  
  self.send(Commands.NoOperation, 0, function(err, data) {
    if ( err ) {
      callback(false);
    } else {
      
      console.log(data);
      // TODO validate buffer, first test with real data
      var ok = ( data[RelaisByteNames.Command] == 255 );
      callback(ok); 
      
    }
  });
};
/**
 * @param {SuccessCallback} callback
 * */
Relais.prototype.NOP = function(callback) {
  this.noOperation(callback);
};

/**
 * @param {SuccessCallback} callback
 * */
Relais.prototype.setup = function(callback) {
  var self = this;
  if ( !callback ) {
    callback = function() {};
  }
  
  if ( self.relaisID === 0 ) {
    self.send(Commands.Setup, 0, function(err, data) {
      if ( err ) {
        callback(false);
      } else {
       
        if ( data[RelaisByteNames.Command] == ( 255 - Commands.Setup ) ) {
          self.relaisID = data[RelaisByteNames.Address];
        
          callback(true);
        }
        
      }
    });
  }
  
  callback(false);
};

/**
 * @param {ErrorResultCallback}
 * */
Relais.prototype.getPort = function(callback) {
  var self = this;
  if ( !callback ) {
    return;
  }
  
  self.send(Commands.GetPort, 0, function(err, data) {
    if ( err ) {
      callback(err);
    } else {
     
      if ( data[RelaisByteNames.Command] == ( 255 - Commands.GetPort ) ) {
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
Relais.prototype.setPort = function(relais) {
  this.send(Commands.SetPort, relais);
};

/**
 * @param {ErrorResultCallback} callback
 * */
Relais.prototype.getOption = function(callback) {
  var self = this;
  if ( !callback ) {
    return;
  }
  
  self.send(Commands.GetOption, 0, function(err, data) {
    if ( err ) {
      callback(err);
    } else {
      
      if ( data[RelaisByteNames.Command] == ( 255 - Commands.GetOption) ) {
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
Relais.prototype.setOption = function(option) {
  this.send(Commands.SetOption, option);
};

/**
 * @param {byte} relais
 * @param {ErrorResultCallback} callback
 * */
Relais.prototype.setSingle = function(relais, callback) {
  var self = this;
  if ( !callback ) {
    callback = function() {};
  }
  
  self.send(Commands.SetSingle, relais, function(err, data) {
    if ( err ) {
      callback(err);
    } else {
      
      if ( data[RelaisByteNames.Command] == ( 255 - Commands.SetSingle ) ) {
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
Relais.prototype.delSingle = function(relais, callback) {
  var self = this;
  if ( !callback ) {
    callback = function() {};
  }
  
  self.send(Commands.DelSingle, relais, function(err, data) {
    if ( err ) {
      callback(err);
    } else {
      
      if ( data[RelaisByteNames.Command] == ( 255 - Commands.DelSingle ) ) {
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
Relais.prototype.toggle = function(relais, callback) {
  var self = this;
  if ( !callback ) {
    callback = function() {};
  }
  
  self.send(Commands.Toggle, relais, function(err, data) {
    if ( err ) {
      callback(err);
    } else {
      
      if ( data[RelaisByteNames.Command] == ( 255 - Commands.Toggle ) ) {
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
Relais.prototype.activateAll = function(delay, callback) {
  this._iterateAllRelais(delay, this.setSingle, callback);
};

/**
 * @param {int} delay
 * @param {Callback} callback
 * */
Relais.prototype.deactivateAll = function(delay, callback) {
  this._iterateAllRelais(delay, this.delSingle, callback);
};

/**
 * @param {uint} delay
 * @param {Function} relaisOperation - An operation that is passed a relais number that it should work on.
 * @param {Callback} callback
 * */
Relais.prototype._iterateAllRelais = function(delay, relaisOperation, callback) {
  var self = this;
  if ( !delay ) {
    delay = 0;
  }
  if ( !callback ) {
    callback = function() {};
  }
  
  if ( delay === 0 ) {
    relaisOperation.call(self, self.getAllRelais());
  } else {
    var relaisNums = [ 1, 2, 4, 8, 16, 32, 64, 128 ];
    
    async.each(relaisNums, function(item, cb) {
      
      // item == relaisnum
      relaisOperation.call(self, item);
      
      setTimeout(function() {
        cb();
      }, delay);
      
    }, function(err) {
      // done
      callback();
    });
    
  }
};

module.exports = Relais;
