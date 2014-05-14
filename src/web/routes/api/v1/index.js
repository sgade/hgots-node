var assert = require('assert');
// routes
var users = require('./users');
var cards = require('./cards');
// setup
var setup = require('./setup');

module.exports = function(app) {
  var prefix = '/api/v1';
  
  assert(!!app, "App must be given so routes can be added for API/v1.");
  
  app.get(prefix + '/users', users.getAllUsers);
  app.post(prefix + '/users', users.createNewUser);
  app.get(prefix + '/users/:id', users.getUser);
  app.put(prefix + '/users/:id', users.updateUser);
  app.delete(prefix + '/users/:id', users.deleteUser);
  
  app.get(prefix + '/users/:id/cards', cards.getCardsOfUser);
  app.post(prefix + '/users/:id/cards', cards.createNewCard);
  app.delete(prefix + '/users/:userid/card/:id', cards.deleteCard);
  
  app.post(prefix + '/setup-auth', setup.authenticate);
  app.post(prefix + '/setup', setup.setPreferences);
};
