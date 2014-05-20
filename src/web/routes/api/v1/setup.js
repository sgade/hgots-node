var config = require('./../../../../config');
var helpers = require('./helpers');

exports.authenticate = function(req, res) {
  var code = req.body.code;
  
  req.session.setupCode = code;
  
  res.redirect('/');
};

exports.doSetup = function(req, res) {
  var data = req.body;
  
  if ( !data || !data.admin ) {
    return res.status(400).end();
  }
  
  var admin = data.admin;
  var username = admin.username;
  var password = admin.password;
  
  if ( password !== admin.passwordRepeat ) {
    return res.status(400).end();
  }
  
  helpers.createUser({
    username: username,
    password: password,
    type: 'Admin'
  }, function(err, user) {
    if ( !!err ) {
      return res.status(500).end();
    }
    if ( !user ) {
      return res.status(400).end();
    }
    
    req.user = user;
  });
};
