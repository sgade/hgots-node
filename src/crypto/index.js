var crypto = require('crypto');

var ALGORITHM = 'sha256';
var DIGEST = 'hex';

exports.encrypt = function(text) {
  var cypher = crypto.createHash(ALGORITHM);
  
  cypher.update(text);
  return cypher.digest(DIGEST);
};
