var assert = require('assert');
var db = require('../../../../db/');

var PUBLIC_ATTRIBUTES = [ 'id', 'username', 'type' ];

exports.db = db;

exports.getAllUsers = function(callback) {
  db.User.findAll({
    attributes: PUBLIC_ATTRIBUTES
  }).complete(callback);
};
exports.getUser = function(where, callback) {
  db.User.find({
    where: where,
    attributes: PUBLIC_ATTRIBUTES // send over the wire
  }).complete(callback);
};

exports.getRequestingUser = function(req, callback) {
  assert(callback, "Callback must be defined.");
  
  callback(null, req.user);
};
