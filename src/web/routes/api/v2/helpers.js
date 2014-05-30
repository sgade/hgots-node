/*
 * Internal Helpers
 * */
exports.getRequestingUser = function(req, callback) {
  var user = req.user;
  return callback(null, user);
};

/*
 * Status helpers
 * */
// xxx
exports.sendStatusMessage = function(res, status, object) {
  var json = JSON.stringify(object);
  return res.status(status).end(json);
};
exports.sendStatusError = function(res, status, errorDescription) {
  var error = {
    error: errorDescription
  };
  return exports.sendStatusMessage(res, status, error);
};
// 403
exports.sendForbidden = function(res, errorDescription) {
  errorDescription = errorDescription || "Forbidden";
  return exports.sendStatusError(res, 403, errorDescription);
};
// 500
exports.sendInternalServerError = function(res, errorDescription) {
  errorDescription = errorDescription || "Internal Server Error";
  return exports.sendStatusError(res, 500, errorDescription);
};
 
/*
 * Flow helpers
 * */

// AUTHENTICATION
exports._checkUserAuthentication = function(req, res, callback, authCallback) {
  return exports.getRequestingUser(req, function(err, user) {
    if ( !!err ) {
      return exports.sendInternalServerError(res);
    }
    
    var authenticated = authCallback(null, user);
    if ( !authenticated ) {
      return exports.sendForbidden(res);
    }
    
    return callback(null, {
      authenticated: authenticated,
      user: user
    });
  });
};
exports.authenticate = function(req, res, callback) {
  return exports._checkUserAuthentication(req, res, callback, function(err, user) {
    return !!user;
  });
};
exports.authenticatePrivileged = function(req, res, callback) {
  return exports._checkUserAuthentication(req, res, callback, function(err, user) {
    return !!user && user.isPrivileged();
  });
};
exports.authenticateAdmin = function(req, res, callback) {
  return exports._checkUserAuthentication(req, res, callback, function(err, user) {
    return !!user && user.isAdmin();
  });
};
// SENDING models
exports.getPublicModels = function(modelList, callback) {
  var retVal = modelList.map(function(model) {
    return model.getPublicModel();
  });
  return callback(null, retVal);
};
exports.sendPublicModels = function(res, modelList, wrapper) {
  exports.getPublicModels(modelList, function(err, models) {
    if ( !!err ) {
      return exports.sendInternalServerError(res);
    }
    
    var response = {};
    response[wrapper] = models;
    return exports.sendStatusMessage(res, 200, response);
  });
};
