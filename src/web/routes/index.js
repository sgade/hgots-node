/*
 * Routes that render html or redirect to html rendering pages.
 * */

var fs = require('fs');

var helpers = require('./helpers');
var pkg = require('./../../../package');
var db = require('./../../db/');

var availableLanguages = fs.readdirSync(__dirname + '/../public/js/languages');

for(var i = 0; i < availableLanguages.length; i++)
  availableLanguages[i] = availableLanguages[i].split(".")[0]

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

/* Special stuff for i18n */
exports.i18n = function(req, res) {
  var language = req.acceptsLanguage(availableLanguages);
  console.log(__dirname + '/../public/js/languages/' + language + '.js');
  fs.createReadStream(__dirname + '/../public/js/languages/' + language + '.js').pipe(res);
}
exports.logout = function(req, res) {
  req.logout();

  res.redirect('/');
};
