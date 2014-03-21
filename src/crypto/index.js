var crypto = require('crypto');

var ALGORITHM = 'sha256';
var DIGEST = 'base64';

exports.encrypt = function(text) {
  var cypher = crypto.createHash(ALGORITHM);
  
  cypher.update(text);
  return cypher.digest(DIGEST);
};
