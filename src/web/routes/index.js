/*
 * Routes
 * */

var pkg = require('../../../package');

function validateUser(user, pw) {
  if ( !user || !pw ) {
    return false;
  }
  
  // TODO goto db
  
  return true;
}

/* Default route */
exports.index = function(req, res) {
  if ( validateUser(req.session.username, req.session.password) ) {
    res.redirect('/app');
  } else {
    res.render('index', {
      title: pkg.name
    });
  }
};
exports.validateLogin = function(req, res) {
  var params = req.body;
  var username = params.username,
    password = params.password;
  
  var msg = {
    statusCode: 200,
    message: "OK"
  };
  if ( !validateUser(username, password) ) {
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
};
exports.logout = function(req, res) {
  req.session.username = "";
  req.session.password = "";
  
  res.redirect('/');
};

exports.app = function(req, res) {
  if ( !validateUser(req.session.username, req.session.password) ) {
    res.redirect('/');
  } else {
    res.render('app', {
      title: pkg.name
    });
  }
};
