var util = require('util');
var config = require('./config');
var fs = require('fs');
var path = require('path');

module.exports = function() {
  // check for log directory
  var logsDir = './logs/';
  fs.exists(logsDir, function(exists) {
    if ( !exists ) {
      fs.mkdir(logsDir, function(err) {
        if ( !!err ) {
          console.log("Could not create log directory.");
          throw err;
        }
      });
    }
  });
  
  console.log = function() {
    
    var string = "";
    for ( var i = 0; i < arguments.length; i++ ) {
      var argument = arguments[i];
      if ( typeof argument == "object" ) {
        string += util.inspect(argument);
      } else {
        string += argument;
      }
      string += " ";
    }
    string = string.trim();
    
    util.log(string);
    
    // log to file, if on production
    if ( process.env.NODE_ENV !== 'production' ) {
      var d = new Date();
      
      date = d.getFullYear() + "." + ( d.getMonth() + 1 ) + "." + d.getDate();
      var currentLogName = util.format(config.logname, date);
      currentLogName = path.join(logsDir, currentLogName);
      time = d.getHours() + ":" + d.getMinutes() + ":" + d.getSeconds();
      
      string += '\n';
      string = time + ': ' + string;
      fs.appendFile(currentLogName, string, function(err) {
        if ( !!err ) {
          throw err;
        }
      });
    }
    
  };
};
