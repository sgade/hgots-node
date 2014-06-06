var helpers = require('./helpers');

var callbacks = {
  rfidRequestCallback: function(callback) { return callback(null, null); },
  openDoorRequestCallback: function(callback) { return callback(null, null); }
};
exports.setRFIDRequestCallback = function(callback) {
  callbacks.rfidRequestCallback = callback;
  return callback;
};
exports.setOpenDoorRequestCallback = function(callback) {
  callbacks.openDoorRequestCallback = callback;
  return callback;
};

exports.getRFID = function(req, res) {
  return helpers.authenticatePrivileged(req, res, function(err, authenticationResponse) {
    return callbacks.rfidRequestCallback(function(err, data) {
      if ( !!err ) {
        return helpers.sendInternalServerError(res);
      }
      
      return helpers.sendOk(res, {
        rfid: data
      });
    });
  });
};

exports.openDoor = function(req, res) {
  return helpers.authenticate(req, res, function(err, authenticationResponse) {
    return callbacks.openDoorRequestCallback(function(err) {
      if ( !!err ) {
        return helpers.sendInternalServerError(res);
      }
      
      return helpers.sendOk(res);
    });
  });
};
