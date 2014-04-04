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

exports.createUser = function(data, callback) {
  db.User.create(data).complete(callback);
};
exports.updateUser = function(id, data, callback) {
  // prevent 'undefined' values:
  db.User.find({
    where: {
      id: id
    }
  }).complete(function(err, user) {
    if ( err ) {
      callback(err);
    } else {
      user.username = data.username || user.username;
      user.password = data.password || user.password;
      user.type = data.type || user.type;
      
      user.save().complete(function(err) {
        callback(err, user);
      });
    }
  });
};

exports.deleteUserObject = function(user, callback) {
  user.destroy().complete(callback);
};

/* Helpers for the API */
exports.getRequestingUser = function(req, callback) {
  assert(callback, "Callback must be defined.");
  
  callback(null, req.user);
};

exports.getPublicUser = function(user) {
  assert(!!user, "User object must be given.");
  
  var publicUser = {
    id: user.id,
    username: user.username,
    type: user.type
    //updatedAt: user.updatedAt
  };
  
  return publicUser;
};
exports.sendPublicUser = function(res, user) {
  assert(!!res, "Response object must be given.");
  
  var publicUser = exports.getPublicUser(user);
  
  res.set('Content-Type', 'application/json').end(JSON.stringify(publicUser));
};
exports.getPublicCard = function(card) {
  assert(!!card, "Card object must be given.");
  
  var publicCard = {
    id: card.id,
    uid: card.uid,
    UserId: card.UserId
  };
  
  return publicCard;
};
