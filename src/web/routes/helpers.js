var db = require('../../db/');

function getRequestingUser(req, callback) {
  callback(null, req.user);
}
exports.getRequestingUser = getRequestingUser;

/**
 * @param {Request} req - The express request object.
 * @param {SuccessCallback} callback
 * */
function validateAuthenticatedRequest(req, callback) {
  getRequestingUser(req, function(err, user) {
    if ( err ) {
      throw err;
    }
    
    var ok = !!user;
    
    callback(ok);
  });
}
exports.validateAuthenticatedRequest = validateAuthenticatedRequest;
