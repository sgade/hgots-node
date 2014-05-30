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
  return res.status(status).set('Content-Type', 'application/json').end(json);
};
exports.sendStatusError = function(res, status, errorDescription) {
  errorDescription = errorDescription || "Unknown";
  var error = {
    error: errorDescription
  };
  return exports.sendStatusMessage(res, status, error);
};
// 200
exports.sendOk = function(res, data) {
  return exports.sendStatusMessage(res, 200, data);
};
// 400
exports.sendBadRequest = function(res, errorDescription) {
  errorDescription = errorDescription || "Bad Request";
  return exports.sendStatusError(res, 400, errorDescription);
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
  if ( !modelList.length ) {
    modelList = [ modelList ];
  }
  
  var retVal = modelList.map(function(model) {
    return model.getPublicModel();
  });
  
  if ( retVal.length === 1 ) {
    retVal = retVal[0];
  }
  return callback(null, retVal);
};
exports.sendPublicModels = function(res, publicModels, wrapper) {
  var response = {};
  response[wrapper] = publicModels;
  return exports.sendOk(res, response);
};
exports.sendModels = function(res, modelList, wrapper) {
  exports.getPublicModels(modelList, function(err, models) {
    if ( !!err ) {
      return exports.sendInternalServerError(res);
    }
    
    exports.sendPublicModels(res, models, wrapper);
  });
};
