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
var queries = require('./routes/queries');
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
exports.init = function(port, rfidRequestCallback, openDoorCallback, done) {
  queries.setRFIDRequestCallback(rfidRequestCallback);
  queries.setOpenDoorCallback(openDoorCallback);
  
  app = express();
  configure(port);
  db.init(done);
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
  if ('development' === app.get('env')) {
    app.use(express.errorHandler());
  }
  
  configureRoutes();
}
function configureRoutes() {
  // Routes for login
  app.get('/', routes.index);
  app.get('/logout', routes.logout);
  app.post('/validate_login', queries.validateLogin);
  // Routes for app
  app.get('/app', routes.app);
  app.get('/get_rfid', queries.getRFID);
  app.get('/open_door', queries.openDoor);
  
  // configure api
  require('./routes/api/')(app);
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
