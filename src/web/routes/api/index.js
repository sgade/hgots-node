// Load current api
module.exports = function(app) {
  return require('./v1/')(app);
};
