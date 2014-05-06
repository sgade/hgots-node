/*
 * Routes that render html or redirect to html rendering pages.
 * */

var helpers = require('./helpers');
var pkg = require('./../../../package');
var db = require('./../../db/');

/* Default route: Login */
exports.index = function(req, res) {
  helpers.validateAuthenticatedRequest(req, function(ok) {
    
    if ( ok ) {
      res.redirect("/app");
    } else {
      
      res.render('index', {
        title: pkg.name
      });
      
    }
    
  });
};

/* Default route: App */
exports.app = function(req, res) {
  helpers.validateAuthenticatedRequest(req, function(ok) {
    
    if ( !ok ) {
      res.redirect('/');
    } else {
      res.render('app', {
        title: pkg.name
      });
    }
    
  });
};
exports.logout = function(req, res) {
  req.logout();
  
  res.redirect('/');
};
