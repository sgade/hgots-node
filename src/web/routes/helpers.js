var db = require('../../db/');

/**
 * @param {Request} req - The express request object.
 * @param {SuccessCallback} callback
 * */
function validateAuthenticatedRequest(req, callback) {
  var ok = !!req.user;
  
  callback(ok);
}
exports.validateAuthenticatedRequest = validateAuthenticatedRequest;
