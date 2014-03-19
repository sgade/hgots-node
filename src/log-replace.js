var util = require('util');

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
    
  };
};
