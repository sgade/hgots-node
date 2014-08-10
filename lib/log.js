var util = require('util');
var Writable = require('stream').Writable;

var fs = require('fs');
var path = require('path');
var config = require('./config');

var creatingLog = false;

function LogStream(highWaterMark, decodeStrings, objectMode) {
  Writable.call(this, highWaterMark, decodeStrings, objectMode);
  
  this.write = function(chunk, encoding, callback) {
    callback = callback || function() {};
    
    if ( decodeStrings ) {
      chunk = chunk.toString(encoding);
    }
    
    console.log(chunk);
    
    callback(null);
  };
}
util.inherits(LogStream, Writable);

exports.LogStream = LogStream;

exports.writeToLog = function(string, callback) {
  callback = callback || function() {};
  var logsDir = './logs/';
  
  function zerofy(num) {
    if ( num < 10 ) {
      return "0" + num;
    } else {
      return num;
    }
  }
  function getTodaysLogName(d) {
    var date = d.getFullYear() + "." + ( d.getMonth() + 1 ) + "." + d.getDate();
    var currentLogName = util.format(config.logname, date);
    currentLogName = path.join(logsDir, currentLogName);
    
    return currentLogName;
  }
  
  var d = new Date();
  
  var time = zerofy(d.getHours()) + ":" + zerofy(d.getMinutes()) + ":" + zerofy(d.getSeconds());
    
  string += '\n';
  string = time + ': ' + string;
  
  // check for log directory
  fs.exists(logsDir, function(exists) {
    if ( !exists ) {
      if ( creatingLog ) {
        return writeToLog();
      }
      
      creatingLog = true;
      fs.mkdir(logsDir, function(err) {
        creatingLog = false;
        if ( !!err ) {
          console.log("Could not create log directory.");
          throw err;
        }
        
        writeToLog();
      });
    } else {
      writeToLog();
    }
  });
  
  function writeToLog() {
    var currentLogName = getTodaysLogName(d);
    fs.appendFile(currentLogName, string, function(err) {
      if ( !!err ) {
        throw err;
      }
    });
  }
};
