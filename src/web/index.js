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
var cluster = require('cluster');
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
  expressTimeout = require('connect-timeout'),
  SQLiteStore = require('connect-sqlite3')(expressSession);
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
var servers = [];

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
function expressOnTimeout(req, res, next) {
  if ( !req.timedout ) {
    return next();
  }
  res.end();
  console.log("Middleware timeout.");
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
  app.use(expressTimeout(5000));
  app.use(expressCompress({ // compress all data
    threshold: 256
  }));
  app.use(expressSendServerHeader); // send 'Server' header
  app.use(expressOnTimeout);
  app.use(expressBodyParser());
  app.use(expressMethodOverride());
  app.use(expressOnTimeout);
  app.use(expressCookieParser(config.web.secret)); // cookies
  app.use(expressSession({ // session support
    secret: config.web.secret,
    store: new SQLiteStore()
  }));
  app.use(expressOnTimeout);

  if ('development' === app.get('env')) {
    // development only:
    app.use(expressErrorHandler()); // error handler
    app.use(expressMorgan({ // dev logs
      format: 'dev'
    }));
  } else if ('production' === app.get('env')) {
    app.use(expressMorgan('short')); // request logs
  }
  app.use(expressOnTimeout);
  
  configurePassport(); // configure passport

  app.use(expressFavicon(path.join(__dirname, 'client/favicon.ico'))); // send favicon
  if(typeof PhusionPassenger === 'undefined') {
    app.use(expressStatic(path.join(__dirname, 'public'))); // only serve static files if not using Passenger
  }
  app.use(expressOnTimeout);
  
  // Catch HEAD requests, makes them faster
  app.use(function(req, res, next) {
    if ( req.method.toLowerCase() === 'head' ) {
      res.end();
    }
    return next();
  });
  app.use(expressOnTimeout);
  
  // all middleware registered, now the final routes
  configureRoutes(callbacks);
  app.use(expressOnTimeout);
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
  if ( servers.length > 0 ) {
    for ( var i = 0; i < servers.length; i++ ) {
      servers[i].close(callback);
    }
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
  if ( cluster.isMaster ) {
    var numCPUS = require('os').cpus().length;
    var runningWorkers = 0;
    console.log("Spawning", numCPUS, "workers.");
    if ( numCPUS < 1 ) {
      throw new Error("Invalid num of CPUS:", numCPUS);
    }
    var start = function() {
      if ( runningWorkers < numCPUS ) {
        cluster.once('fork', function() {
          runningWorkers++;
        });
        cluster.once('listening', function() {
          start();
        });
        
        cluster.fork();
      }
    };
    
    cluster.on('fork', function(worker) {
      console.log("worker", worker.process.pid, "forked");
    });
    cluster.on('online', function(worker) {
      console.log('worker', worker.process.pid, 'online');
    });
    cluster.on('listening', function(worker, address) {
      console.log("worker", worker.process.pid, "listening");
    });
    cluster.on('disconnect', function(worker) {
      console.log("worker", worker.process.pid, "disconnected");
    });
    cluster.on('exit', function(worker, code, signal) {
      console.log("worker", worker.process.pid, 'died');
      runningWorkers--;
      start(); // restart
    });
    
    start(); // fork first
  } else {
    var server = http.createServer(app);
    server.listen(app.get('port'), function() {
      console.log("worker", cluster.worker.process.pid, "started server");
      callback();
    });
    
    servers.push(server);
  }
};

// start the server if we are invoked directly
if ( !module.parent ) {
  var nullCallback = function(cb) { return cb(null, null); };
  exports.init(config.web.port, nullCallback, nullCallback, function(err) {
    if ( !!err ) {
      throw err;
    }
    
    exports.start(function() {
      console.log('Express server listening on port ' + app.get('port') + ".");
    });
  });
}

/**
 * An callback that is simply called with no parameters.
 * @callback Callback
 * */
