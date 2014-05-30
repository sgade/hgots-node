var users = require('./users');

module.exports = function(app) {
  var prefix = '/api/v2';
  
  app.get(prefix + '/users', users.getUsers);
  app.post(prefix + '/users', users.newUser);
  
  return prefix;
};
