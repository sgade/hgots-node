var fs = require('fs');
var util = require('util');

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
    var day = params.date;
    if ( !year || !month || !day ) {
      return helpers.sendBadRequest(res);
    }
    
    var date = year + "." + month + "." + day;
    var logName = util.format(config.logname, date);
    logName = './logs/' + logName;
    console.log("file:", logName);
    fs.exists(logName, function(exists) {
      if ( !exists ) {
        return helpers.sendNotFound(res);
      }
      
      fs.readFile(logName, function(err, buffer) {
        if ( !!err ) {
          return helpers.sendInternalServerError(res);
        }
        var content = buffer.toString('utf-8');
        
        var json = {
          log: {
            year: year,
            month: month,
            date: day,
            content: content
          }
        };
        
        return helpers.sendOk(res, json);
      });
    });
  });
};
