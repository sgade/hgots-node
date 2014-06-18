var util = require('util');
var Writable = require('stream').Writable;

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
