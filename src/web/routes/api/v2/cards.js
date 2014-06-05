var helpers = require('./helpers');
var db = require('../../../../db/');

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
