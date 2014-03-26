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
      callbacks.openDoorCallback();
      res.status(200);
    } else {
      res.res(403);
    }
    res.end();
  });
};
