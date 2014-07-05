/**
 * Main webserver module
 * @module web/index
 * @author Sören Gade
 * */

/*
 * Module dependencies.
 */
var http = require('http');
var path = require('path');
var config = require('../config');
var pkg = require('../../package');
var LogStream = require('../log').LogStream;
var express = require('express');
var mdns = require('mdns');
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
  expressMorgan = require('morgan'),
  SQLiteStore = require('connect-sqlite3')(expressSession);
var passport = require('passport'),
  PassportLocal = require('passport-local').Strategy;
var routes = require('./routes');
var db = require('../db');

/**
 * The express instance
 * */
var app = null;
var server = null;

/** 
 * The Bonjour/MDNS Server Advertisement
 * */
var ad;

/**
 * Express instance for testing purposes.
 * */
exports.getExpress = function() {
  return app;
};

function expressSendServerHeader(req, res, next) {
  res.set('Server', pkg.name + '/' + pkg.version);
  next();
}

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
  
  ad = mdns.createAdvertisement(mdns.tcp('http'), port);
  ad.start();
};
/**
 * Configures express.
 * @param {Integer} port - The port to listen on.
 * */
function configure(port, callbacks) {
  // config for server
  app.set('port', port || process.env.PORT || 3000);
  app.set('views', path.join(__dirname, 'views'));
  app.set('view engine', 'jade');
  
  // Middlewares
  app.use(expressResponseTime()); // start measuring time
  app.use(expressCompress({ // compress all data
    threshold: 256
  }));
  app.use(expressSendServerHeader); // send 'Server' header
  app.use(expressBodyParser());
  app.use(expressMethodOverride());
  app.use(expressCookieParser(config.web.secret)); // cookies
  
  var sessionStore = null;
  if ('production' === app.get('env')) {
    sessionStore = new SQLiteStore();
  }
  app.use(expressSession({ // session support
    secret: config.web.secret,
    store: sessionStore
  }));

  if ('development' === app.get('env')) {
    // development only:
    app.use(expressErrorHandler()); // error handler
    app.use(expressMorgan({ // dev logs
      format: 'dev'
    }));
  } else if ('production' === app.get('env')) {
    app.use(expressMorgan({
      format: 'short',
      stream: new LogStream()
    })); // request logs
  }

  app.use(expressFavicon(path.join(__dirname, 'client/favicon.ico'))); // send favicon
  if(typeof PhusionPassenger === 'undefined') {
    app.use(expressStatic(path.join(__dirname, 'public'))); // only serve static files if not using Passenger
  }
  
  // Catch HEAD requests, makes them faster
  app.use(function(req, res, next) {
    if ( req.method.toLowerCase() === 'head' ) {
      res.end();
    }
    return next();
  });
  
  // all middleware registered, now the final routes
  configurePassport(); // configure passport
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
  // info about app
  app.get('/info', function(req, res) {
    var pkg = require('./../../package');
    res.set('Content-Type', 'application/json');
    res.end(JSON.stringify(pkg));
  });

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
