// Load current api
module.exports = function(app, callbacks) {
  require('./v1/')(app);
  return require('./v2/')(app, callbacks);
};
