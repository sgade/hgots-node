var assert = require('assert');

module.exports = function(app) {
  var prefix = '/api/v1';
  
  assert(!!app, "App must be given so routes can be added for API/v1.");
};
