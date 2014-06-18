var fs = require('fs');

var config = require('./../../../../config');
var helpers = require('./helpers');

exports.getLogFromDate = function(req, res) {
  return helpers.authenticateAdmin(req, res, function(err, authenticationResponse) {
    
    var params = req.params;
    if ( !params ) {
      return helpers.sendBadRequest(res);
    }
    var year = params.year;
    var month = params.month;
    var date = params.date;
    if ( !year || !month || !date ) {
      return helpers.sendBadRequest(res);
    }
    
    var logName = './logs/access_' + year + "." + month + "." + date + ".log";
    console.log("file:", logName);
    fs.readFile(logName, function(err, buffer) {
      if ( !!err ) {
        return helpers.sendInternalServerError(res);
      }
      var content = buffer.toString('utf-8');
      
      return helpers.sendOk(res, content);
    });
  });
};
