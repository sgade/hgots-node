var assert = require('assert');
// routes
var users = require('./users');
var cards = require('./cards');

module.exports = function(app) {
  var prefix = '/api/v1';
  
  assert(!!app, "App must be given so routes can be added for API/v1.");
  
  app.get(prefix + '/users', users.getAllUsers);
  app.post(prefix + '/users', users.createNewUser);
  app.get(prefix + '/user/:id', users.getUser);
  app.put(prefix + '/user/:id', users.updateUser);
  app.delete(prefix + '/user/:id', users.deleteUser);
  
  app.get(prefix + '/user/:id/cards', cards.getCardsOfUser);
  app.post(prefix + '/user/:id/cards', cards.createNewCard);
};
