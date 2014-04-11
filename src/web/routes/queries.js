/*
 * Calls that are not rendering html or redirecting.
 * */

var helpers = require('./helpers');

var callbacks = {};
exports.setRFIDRequestCallback = function(callback) {
  callbacks.rfidRequestCallback = callback;
};
exports.setOpenDoorCallback = function(callback) {
  callbacks.openDoorCallback = callback;
};

exports.getRFID = function(req, res) {
  helpers.validateAuthenticatedRequest(req, function(ok) {
    if ( ok ) {
      callbacks.rfidRequestCallback(function(data) {
        res.end(data);
      });
    } else {
      res.status(403).end();
    }
  });
};

exports.openDoor = function(req, res) {
  helpers.validateAuthenticatedRequest(req, function(ok) {
    if ( ok ) {
      res.status(200);
      callbacks.openDoorCallback(function() {
        res.end();
      });
    } else {
      res.status(403).end();
    }
  });
};

exports.getUser = function(req, res) {
  helpers.validateAuthenticatedRequest(req, function(ok) {
    if ( ok ) {
      res.status(200);
      helpers.getRequestingUser(req, function(err, user) {
        if ( err ) {
          res.end();
          throw err;
        }
        
        res.set('Content-Type', 'application/json');
        res.end(JSON.stringify(user));
      });
    } else {
      res.status(403).end();
    }
  });
};
