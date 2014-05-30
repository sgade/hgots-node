// Load current api
module.exports = function(app) {
  require('./v1/')(app);
  return require('./v2/')(app);
};
