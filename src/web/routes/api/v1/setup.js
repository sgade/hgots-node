var config = require('./../../../../config');

exports.authenticate = function(req, res) {
  var code = req.body.code;
  
  req.session.setupCode = code;
  
  res.redirect('/');
};

exports.setPreferences = function(req, res) {
  throw new Exception("Not implemted.");
};
