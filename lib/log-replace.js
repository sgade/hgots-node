var util = require('util');

var log = require('./log');

module.exports = function() {
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
    if ( process.env.NODE_ENV === 'production' ) {
      log.writeToLog(string);
    }
    
  };
};
