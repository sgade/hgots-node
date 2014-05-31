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

/* GET /users/:id */
exports.getUser = function(req, res) {
  // if controller or admin
  return helpers.authenticatePrivileged(req, res, function(err, authenticationResponse) {
    var user_id = req.params.id;
    if ( user_id < 1 ) {
      return helpers.sendBadRequest(res);
    }
    
    db.User.find({
      where: {
        id: user_id
      }
    }).complete(function(err, user) {
      if ( !!err ) {
        return helpers.sendInternalServerError(res);
      }
      if ( !user ) {
        return helpers.sendBadRequest(res);
      }
      
      if ( user.type === "Admin" || user.type === "Controller" ) {
        if ( authenticationResponse.user.type === "Controller" ) {
          return helpers.sendForbidden(res);
        }
      }
      
      getPublicUserModelWithCard(user, function(err, publicUser) {
        if ( !!err ) {
          return helpers.sendInternalServerError(res);
        }
        
        helpers.sendPublicModels(res, publicUser, "user");
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

/* PUT /users/:id */
exports.updateUser = function(req, res) {
  // if controller or admin
  return helpers.authenticatePrivileged(req, res, function(err, authenticationResponse) {
    // get and verify parameters
    var user_id = req.params.id;
    if ( user_id < 1 ) {
      return helpers.sendBadRequest(res);
    }
    
    var userBody = req.body.user;
    if ( !userBody ) {
      return helpers.sendBadRequest(res);
    }
    var username = userBody.username,
      password = userBody.password,
      type = userBody.type;
    if ( !username && !password && !type ) {
      return helpers.sendBadRequest(res);
    }
    
    db.User.find({
      where: {
        id: user_id
      }
    }).complete(function(err, user) {
      if ( !!err ) {
        return helpers.sendInternalServerError(res);
      }
      if ( !user ) {
        return helpers.sendBadRequest(res);
      }
      
      if ( user.type === "Admin" || user.type === "Controller" ) {
        if ( authenticationResponse.user.type !== "Admin" ) {
          return helpers.sendForbidden(res);
        }
      }
      
      user.username = username || user.username;
      user.password = password || user.password;
      user.type = type || user.type;
      
      user.save().complete(function(err) {
        if ( !!err ) {
          return helpers.sendInternalServerError(res);
        }
        
        getPublicUserModelWithCard(user, function(err, publicUser) {
          if ( !!err ) {
            return helpers.sendInternalServerError(res);
          }
          
          return helpers.sendPublicModels(res, publicUser, "user", 200);
        });
      });
    });
    
  });
};

/* DELETE /users/:id */
exports.deleteUser = function(req, res) {
  // if controller or admin
  return helpers.authenticatePrivileged(req, res, function(err, authenticationResponse) {
    var user_id = req.params.id;
    if ( user_id < 1 ) {
      return helpers.sendBadRequest(res);
    }
    
    db.User.find({
      where: {
        id: user_id
      }
    }).complete(function(err, user) {
      if ( !!err ) {
        return helpers.sendInternalServerError(res);
      }
      if ( !user ) {
        return helpers.sendBadRequest(res);
      }
      
      // same user:
      if ( user.id === authenticationResponse.user.id ) {
        return helpers.sendForbidden(res);
      }
      if ( user.type === "Controller" || user.type === "Admin" ) {
        if ( authenticationResponse.user.type !== "Admin" ) {
          return helpers.sendForbidden(res);
        }
      }
      
      user.destroy().complete(function(err) {
        if ( !!err ) {
          return helpers.sendInternalServerError(res);
        }
        
        return helpers.sendStatusMessage(res, 200, {});
      });
    });
  });
};
