var users = require('./users');
var misc = require('./misc');
var setup = require('./setup');

module.exports = function(app) {
  var prefix = '/api/v2';
  
  app.get(prefix + '/users', users.getUsers);
  app.get(prefix + '/users/:id', users.getUser);
  app.post(prefix + '/users', users.newUser);
  app.put(prefix + '/users/:id', users.updateUser);
  app.delete(prefix + '/users/:id', users.deleteUser);
  
  app.get(prefix + '/user', users.getCurrentUser);
  app.get(prefix + '/opendoor', misc.openDoor);
  app.get(prefix + '/getrfid', misc.getRFID);
  
  app.post(prefix + '/setup-auth', setup.authenticate);
  app.post(prefix + '/setup', setup.doSetup);
  
  return app;
};
