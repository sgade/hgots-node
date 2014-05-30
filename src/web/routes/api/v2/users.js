var helpers = require('./helpers');
var db = require('../../../../db/');
var async = require('async');
var crypto = require('../../../../crypto/');

function getPublicUserModelWithCard(user, callback) {
  user.getCards().complete(function(err, cards) {
    if ( !!err ) {
      return callback(err);
    }
    
    var publicUser = user.getPublicModel();
    publicUser.cards = [];
    cards.forEach(function(card) {
      publicUser.cards.push(card.getPublicModel());
    });
    
    callback(null, publicUser);
  });
}

/* GET /users */
exports.getUsers = function(req, res) {
  // if controller or admin
  return helpers.authenticatePrivileged(req, res, function(err, authenticationResponse) {
    // get all users
    db.User.findAll().complete(function(err, users) {
      if ( !!err ) {
        return helpers.sendInternalServerError(res);
      }
      
      // only send users if not admin but controller
      if ( authenticationResponse.user.isController() ) {
        users = users.filter(function(user) {
          return !user.isPrivileged();
        });
      }
      
      async.map(users, getPublicUserModelWithCard, function(err, results) {
        if ( !!err ) {
          return helpers.sendInternalServerError(res);
        }
        
        helpers.sendPublicModels(res, results, "users");
      });
    });
  });
};

/* POST /users */
exports.newUser = function(req, res) {
  // if controller or admin
  return helpers.authenticatePrivileged(req, res, function(err, authenticationResponse) {
    // get and verify parameters
    var userBody = req.body.user;
    if ( !userBody ) {
      return helpers.sendBadRequest(res);
    }
    var username = userBody.username,
      password = userBody.password,
      type = userBody.type;
    if ( !username || !password || !type ) {
      return helpers.sendBadRequest(res);
    }
    
    // only admins can create controllers and admins
    if ( type !== "User" && authenticationResponse.user.type !== "Admin" ) {
      return helpers.sendForbidden(res);
    }
    
    password = crypto.encrypt(password);
    db.User.create({
      username: username,
      password: password,
      type: type
    }).complete(function(err, user) {
      if ( !!err ) {
        return helpers.sendInternalServerError(res);
      }
      if ( !user ) {
        return helpers.sendBadRequest(res);
      }
      
      return helpers.sendModels(res, user, "user", 201);
    });
  });
};
