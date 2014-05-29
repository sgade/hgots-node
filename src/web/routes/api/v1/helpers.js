var assert = require('assert');
var db = require('../../../../db/');
var crypto = require('../../../../crypto/');

exports.db = db;

/* Helpers for the API */
exports.getRequestingUser = function(req, callback) {
  assert(callback, "Callback must be defined.");
  
  callback(null, req.user);
};

/* Users */
exports.getAllUsers = function(callback) {
  db.User.findAll().complete(callback);
};
exports.getUser = function(where, callback) {
  db.User.find({
    where: where
  }).complete(callback);
};
exports.createUser = function(data, callback) {
  if ( data && data.password ) {
    data.password = crypto.encrypt(data.password);
  }
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
      user.password = crypto.encrypt(data.password) || user.password;
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
exports.getPublicUserWithCards = function(user, callback) {
  user.getCards().complete(function(err, cards) {
    if ( !!err ) {
      return callback(err);
    }
    
    var publicUser = user.getPublicModel();
    var cardsList = [];
    cards.forEach(function(card) {
      cardsList.push(card.getPublicModel());
    });
    
    return callback(null, publicUser, cardsList);
  });
};
exports.sendPublicUser = function(res, user) {
  assert(!!res, "Response object must be given.");
  assert(!!user, "User object must be given.");
  
  exports.getPublicUserWithCards(user, function(err, publicUser, publicCards) {
    if ( !!err ) {
      return res.status(500).end();
    }
    
    res.set('Content-Type', 'application/json').end(JSON.stringify({
      user: publicUser,
      cards: publicCards
    }));
  });
};

/* Cards */
exports.createCard = function(data, callback) {
  db.Card.create(data).complete(callback);
};
exports.getCard = function(where, callback) {
  db.Card.find(where).complete(callback);
};
exports.deleteCardObject = function(card, callback) {
  card.destroy().complete(callback);
};
