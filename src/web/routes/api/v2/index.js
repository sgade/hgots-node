var users = require('./users');

module.exports = function(app) {
  var prefix = '/api/v2';
  
  app.get(prefix + '/users', users.getUsers);
  app.get(prefix + '/users/:id', users.getUser);
  app.post(prefix + '/users', users.newUser);
  app.put(prefix + '/users/:id', users.updateUser);
  app.delete(prefix + '/users/:id', users.deleteUser);
  
  app.get(prefix + '/user', users.getCurrentUser);
  
  return app;
};
