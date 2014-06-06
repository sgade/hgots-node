var config = require('./../../../../config');
var helpers = require('./helpers');

// from v1
exports.authenticate = function(req, res) {
  var code = req.body.code;
  
  req.session.setupCode = code;
  
  res.redirect('/');
};

exports.doSetup = function(req, res) {
  var data = req.body;
  
  if ( !data || !data.admin ) {
    return helpers.sendBadRequest(res);
  }
  
  var admin = data.admin;
  var username = admin.username;
  var password = admin.password;
  
  if ( password !== admin.passwordRepeat ) {
    return helpers.sendBadRequest(res);
  }
  
  helpers.createUser({
    username: username,
    password: password,
    type: 'Admin'
  }, function(err, user) {
    if ( !!err ) {
      return helpers.sendInternalServerError(res);
    }
    if ( !user ) {
      return helpers.sendBadRequest(res);
    }
    
    return helpers.sendOk(res);
  });
};
