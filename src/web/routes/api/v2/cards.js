var helpers = require('./helpers');
var db = require('../../../../db/');

/* GET /users/:id/cars */
exports.getCardsOfUser = function(req, res) {
  return helpers.authenticatePrivileged(req, res, function(err, authenticationResponse) {
    var userId = req.params.userId;
    if ( userId < 1 ) {
      return helpers.sendBadRequest(res);
    }
    
    return db.User.find({
      where: {
        id: userId
      }
    }).complete(function(err, user) {
      if ( !!err ) {
        return helpers.sendInternalServerError(res);
      }
      if ( !user ) {
        return helpers.sendBadRequest(res);
      }
      
      if ( user.isPrivileged() && authenticationResponse.user.type !== "Admin" ) {
        return helpers.sendForbidden(res);
      }
      
      return db.Card.findAll({
        where: {
          UserId: userId
        }
      }).complete(function(err, cards) {
        if ( !!err ) {
          return helpers.sendInternalServerError(res);
        }
        if ( !cards ) {
          return helpers.sendBadRequest(res);
        }
        
        return helpers.sendModels(res, cards, "cards");
      });
    });
  });
};

/* DELETE /users/:userId/cards/:id */
exports.deleteCardOfUser = function(req, res) {
  return helpers.authenticatePrivileged(req, res, function(err, authenticationResponse) {
    var userId = req.params.userId,
      id = req.params.id;
    if ( userId < 1 || id < 1 ) {
      return helpers.sendBadRequest(res);
    }
    
    return db.User.find({
      where: {
        id: userId
      }
    }).complete(function(err, user) {
      if ( !!err ) {
        return helpers.sendInternalServerError(res);
      }
      if ( !user ) {
        return helpers.sendBadRequest(res);
      }
      
      if ( user.isPrivileged() && authenticationResponse.user.type !== "Admin" ) {
        return helpers.sendForbidden(res);
      }
      
      return db.Card.find({
        where: {
          UserId: userId,
          id: id
        }
      }).complete(function(err, card) {
        if ( !!err ) {
          return helpers.sendInternalServerError(res);
        }
        if ( !card ) {
          return helpers.sendBadRequest(res);
        }
        
        return card.destroy().complete(function(err) {
          if ( !!err ) {
            return helpers.sendInternalServerError(res);
          }
          
          return helpers.sendStatusMessage(res, 200, {});
        });
      });
    });
  });
};
