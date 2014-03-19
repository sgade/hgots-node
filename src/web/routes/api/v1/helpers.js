var assert = require('assert');
var db = require('../../../../db/');

exports.db = db;

exports.getAllUsers = function(callback) {
  db.User.findAll().complete(callback);
};
exports.getUser = function(where, callback) {
  db.User.find({
    where: where,
    attributes: [ 'id', 'username', 'createdAt', 'updatedAt', 'type' ] // send over the wire
  }).complete(callback);
};

exports.getRequestingUser = function(req, callback) {
  assert(callback, "Callback must be defined.");
  
  if ( req.session && req.session.username ) {
    var username = req.session.username;
    
    exports.getUser({
      username: username
    }, callback);
  } else {
    callback(null, null);
  }
};
