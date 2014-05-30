var helpers = require('./helpers');
var db = require('../../../../db/');

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
      
      helpers.sendPublicModels(res, users, "users");
    });
  });
};
