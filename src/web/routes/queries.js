/*
 * Calls that are not rendering html or redirecting.
 * */

var helpers = require('./helpers');

var callbacks = {};
exports.setRFIDRequestCallback = function(callback) {
  callbacks.rfidRequestCallback = callback;
};

/* says yes or no */
exports.validateLogin = function(req, res) {
  var params = req.body;
  var username = params.username,
    password = params.password;
  
  var msg = {
    statusCode: 200,
    message: "OK"
  };
  
  helpers.validateUser(username, password, function(ok) {
    
    if ( !ok ) {
      msg.statusCode = 403;
      msg.message = "Invalid credentials.";
    } else {
      req.session.username = username;
      req.session.password = password;
    }
    
    res.status(msg.statusCode).set({
      'Content-Type': 'application/json'
    });
    res.end(JSON.stringify(msg));
    
  });
};

exports.getRFID = function(req, res) {
  helpers.validateRequest(req, function(ok) {
    if ( ok ) {
      callbacks.rfidRequestCallback(function(data) {
        res.end(data);
      });
    } else {
      res.status(403).end();
    }
  });
};
