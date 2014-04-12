var crypto = require('crypto');

var ALGORITHM = 'sha256';
var DIGEST = 'hex';

exports.encrypt = function(text) {
  if ( !text ) {
    return null;
  }
  var hash = crypto.createHash(ALGORITHM);
  
  hash.update(text);
  return hash.digest(DIGEST);
};
