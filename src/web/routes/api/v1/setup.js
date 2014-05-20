var config = require('./../../../../config');

exports.authenticate = function(req, res) {
  var code = req.body.code;
  
  req.session.setupCode = code;
  
  res.redirect('/');
};

exports.doSetup = function(req, res) {
  throw new Error("Not implemented.");
};
