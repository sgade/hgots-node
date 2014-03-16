var util = require('util');

module.exports = function() {
  console.log = function() {
    
    var string = "";
    for ( var i = 0; i < arguments.length; i++ ) {
      string += arguments[i] + " ";
    }
    string = string.trim();
    
    util.log(string);
    
  };
};
