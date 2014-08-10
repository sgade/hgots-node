var users = require('./users');
var cards = require('./cards');
var misc = require('./misc');
var log = require('./log');

module.exports = function(app, callbacks) {
  var prefix = '/api/v2';
  
  app.get(prefix + '/users', users.getUsers);
  app.get(prefix + '/users/:id', users.getUser);
  app.post(prefix + '/users', users.newUser);
  app.put(prefix + '/users/:id', users.updateUser);
  app.delete(prefix + '/users/:id', users.deleteUser);
  
  app.get(prefix + '/users/:userId/cards', cards.getCardsOfUser);
  app.get(prefix + '/users/:userId/cards/:cardId', cards.getCardOfUser);
  app.post(prefix + '/users/:userId/cards', cards.newCardForUser);
  app.delete(prefix + '/users/:userId/cards/:id', cards.deleteCardOfUser);
  
  app.get(prefix + '/user', users.getCurrentUser);
  misc.setOpenDoorRequestCallback(callbacks.openDoorRequestCallback);
  app.get(prefix + '/opendoor', misc.openDoor);
  misc.setRFIDRequestCallback(callbacks.rfidRequestCallback);
  app.get(prefix + '/getrfid', misc.getRFID);
  
  app.get(prefix + '/log/:year/:month/:date', log.getLogFromDate);
  
  return app;
};
