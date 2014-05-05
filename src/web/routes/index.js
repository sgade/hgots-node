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
      db.User.count().complete(function(err, count) {
        if ( err ) {
          throw err; // TODO: handle or render default /
        }
        
        if ( count === 0 ) {
          res.redirect('/setup');
        } else {
          res.render('index', {
            title: pkg.name
          });
        }
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

/* Initial setup route */
exports.setup = function(req, res) {
  db.User.count().complete(function(err, count) {
    if ( err || count ) {
      res.redirect('/');
    } else {
      
      // if no entries are in the db, then we want the setup
      res.render('setup', {
        title: pkg.name
      });
      
    }
  });
};
