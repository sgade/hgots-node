var status = require('statuses');

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
  return exports.sendStatusMessage(res, status('OK'), data);
};
// 400
exports.sendBadRequest = function(res, errorDescription) {
  errorDescription = errorDescription || "Bad Request";
  return exports.sendStatusError(res, status('Bad Request'), errorDescription);
};
// 403
exports.sendForbidden = function(res, errorDescription) {
  errorDescription = errorDescription || "Forbidden";
  return exports.sendStatusError(res, status('Forbidden'), errorDescription);
};
// 500
exports.sendInternalServerError = function(res, errorDescription) {
  errorDescription = errorDescription || "Internal Server Error";
  return exports.sendStatusError(res, status('Internal Server Error'), errorDescription);
};
// For API customization
exports.status = function(input) {
  return status(input);
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
exports.getPublicModels = function(modelList, wrapper, callback) {
  if ( !modelList.length ) {
    modelList = [ modelList ];
  }
  
  var retVal = modelList.map(function(model) {
    return model.getPublicModel();
  });
  
  if ( retVal.length === 1 && wrapper[wrapper.length - 1] !== 's' ) { // if length is one and wrapper does not end with 's' (-> plural) give back one argument
    retVal = retVal[0];
  }
  return callback(null, retVal);
};
exports.sendPublicModels = function(res, publicModels, wrapper, status) {
  status = status || 200;
  
  var response = {};
  response[wrapper] = publicModels;
  
  return exports.sendStatusMessage(res, status, response);
};
exports.sendModels = function(res, modelList, wrapper, status) {
  exports.getPublicModels(modelList, wrapper, function(err, models) {
    if ( !!err ) {
      return exports.sendInternalServerError(res);
    }
    
    exports.sendPublicModels(res, models, wrapper, status);
  });
};
