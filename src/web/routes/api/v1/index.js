var assert = require('assert');
var users = require('./users');

module.exports = function(app) {
  var prefix = '/api/v1';
  
  assert(!!app, "App must be given so routes can be added for API/v1.");
  
  app.get(prefix + '/users', users.getAllUsers);
  app.post(prefix + '/users', users.createNewUser);
  app.get(prefix + '/user/:id', users.getUser);
  app.get(prefix + '/user/:id/cards', users.getCardsOfUser);
};
