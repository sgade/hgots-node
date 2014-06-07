/**
 * Main webserver module
 * @module web/index
 * @author Sören Gade
 * */

/*
 * Module dependencies.
 */
var config = require('../config');
var pkg = require('../../package');
var express = require('express');
// middleware
var expressBodyParser = require('body-parser'),
  expressCookieParser = require('cookie-parser'),
  expressSession = require('express-session'),
  expressFavicon = require('serve-favicon'),
  expressCompress = require('compression'),
  expressMethodOverride = require('method-override'),
  expressErrorHandler = require('errorhandler'),
  expressStatic = require('serve-static'),
  expressResponseTime = require('response-time'),
  expressMorgan = require('morgan');
var passport = require('passport'),
  PassportLocal = require('passport-local').Strategy;
var routes = require('./routes');
var http = require('http');
var path = require('path');
var db = require('../db');

/**
 * The express instance
 * */
var app = null;
var server = null;

/**
 * Express instance for testing purposes.
 * */
exports.getExpress = function() {
  return app;
};

/**
 * Initializes the server instance and configures express.
 * @param {Integer} port - The port to listen on.
 * */
exports.init = function(port, getRFIDRequestCallback, openDoorRequestCallback, done) {
  app = express();
  configure(port, {
    rfidRequestCallback: getRFIDRequestCallback,
    openDoorRequestCallback: openDoorRequestCallback
  });
  db.init(done);
};
/**
 * Configures express.
 * @param {Integer} port - The port to listen on.
 * */
function configure(port, callbacks) {
  // all environments
  app.set('port', port || process.env.PORT || 3000);
  app.set('views', path.join(__dirname, 'views'));
  app.set('view engine', 'jade');
  
  app.use(expressResponseTime());
  app.use(function(req, res, next) {
    res.set('Server', pkg.name + '/' + pkg.version);
    next();
  });
  app.use(expressFavicon(path.join(__dirname, 'client/favicon.ico')));
  app.use(expressCompress({
    threshold: 256
  }));
  app.use(expressBodyParser());
  app.use(expressMethodOverride());
  app.use(expressCookieParser(config.web.secret));
  app.use(expressSession({
    secret: config.web.secret
  }));
  configurePassport();

  if(typeof PhusionPassenger === 'undefined') { // only serve static files if not using Passenger
    app.use(expressStatic(path.join(__dirname, 'public')));
  }

  // development only
  if ('development' === app.get('env')) {
    app.use(expressErrorHandler());
    app.use(expressMorgan({
      format: 'dev'
    }));
  } else {
    app.use(expressMorgan('short'));
  }

  configureRoutes(callbacks);
}
function configurePassport() {
  app.use(passport.initialize());
  app.use(passport.session());

  // username and password based authentication
  passport.use(new PassportLocal(function(username, password, done) {
    db.User.find({
      where: {
        username: username,
        password: password
      }
    }).complete(function(err, user) {
      if ( err ) {
        return done(err);
      }

      if ( !user ) {
        return done(null, false, { message: 'Incorrect credentials.' });
      } else {
        return done(null, user);
      }
    });
  }));
  passport.serializeUser(function(user, done) {
    done(null, user.id);
  });
  passport.deserializeUser(function(id, done) {
    db.User.find({
      where: {
        id: id
      }
    }).complete(function(err, user) {
      done(err, user);
    });
  });
}
function configureRoutes(callbacks) {
  // info about app
  app.get('/info', function(req, res) {
    var pkg = require('./../../package');
    res.set('Content-Type', 'application/json');
    res.end(JSON.stringify(pkg));
  });
  // Routes for login
  app.get('/', routes.index);
  app.get('/logout', routes.logout);
  app.get('/login', function(req, res) {
    res.redirect('/');
  });
  app.post('/auth/login', passport.authenticate('local', {
    successRedirect: '/app',
    failureRedirect: '/'
  }));
  // Routes for app
  app.get('/app', routes.app);

  // configure api
  require('./routes/api/')(app, callbacks);
}

/**
 * Stops the express server.
 * */
exports.stop = function(callback) {
  if ( server ) {
    server.close(callback);
  }
};

/**
 * Returns the port set by the init function.
 * @returns {Integer} The port.
 * */
exports.getPort = function() {
  return app.get('port');
};

/**
 * Starts the express web server.
 * @param {Callback} callback - A callback that is called once the server is running.
 * */
exports.start = function(callback) {
  server = http.createServer(app);
  server.listen(app.get('port'), callback);
};

// start the server if we are invoked directly
if ( !module.parent ) {
  exports.init();
  exports.start(function() {
    console.log('Express server listening on port ' + app.get('port') + ".");
  });
}

/**
 * An callback that is simply called with no parameters.
 * @callback Callback
 * */
