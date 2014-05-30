var helpers = require('./helpers');
var db = require('../../../../db/');
var async = require('async');

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
