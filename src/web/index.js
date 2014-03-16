/**
 * Main webserver module
 * @module web/index
 * @author Sören Gade
 * */

/*
 * Module dependencies.
 */
var express = require('express');
var routes = require('./routes');
var http = require('http');
var path = require('path');

/**
 * The express instance
 * */
var app = null;
var server = null;
var callbacks = {};

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
exports.init = function(port, rfidRequestCallback) {
  callbacks.rfidRequestCallback = rfidRequestCallback;
  
  app = express();
  configure(port);
};
/**
 * Configures express.
 * @param {Integer} port - The port to listen on.
 * */
function configure(port) {
  // all environments
  app.set('port', port || process.env.PORT || 3000);
  app.set('views', path.join(__dirname, 'views'));
  app.set('view engine', 'jade');
  app.use(express.favicon());
  // app.use(express.logger('dev'));
  app.use(express.json());
  app.use(express.urlencoded());
  app.use(express.methodOverride());
  app.use(express.cookieParser('your secret here'));
  app.use(express.session());
  app.use(app.router);
  app.use(express.static(path.join(__dirname, 'public')));

  // development only
  if ('development' == app.get('env')) {
    app.use(express.errorHandler());
  }
  
  // Routes for login
  app.get('/', routes.index);
  app.get('/logout', routes.logout);
  app.post('/validate_login', routes.validateLogin);
  // Routes for app
  app.get('/app', routes.app);
  app.get('/get_rfid', function(req, res) {
    callbacks.rfidRequestCallback(function(data) {
      res.end(data);
    });
  });
}

/**
 * Stops the express server.
 * */
exports.stop = function(callback) {
  server.close(callback);
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
