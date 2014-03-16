/**
 * The main database module.
 * @module db/index
 * @author Sören Gade
 *
 * @requires sequelize
 * */

var config = require('../config');
var Sequelize = require('sequelize');

var sequelize = new Sequelize(config['db-name'], config['db-username'], config['db-password'], {
  dialect: 'sqlite',
  storage: config['db-name']
});

var User = sequelize.define('User', {
  username: Sequelize.STRING,
  password: Sequelize.STRING,
});

sequelize.sync().complete(function(err) {
  if ( !err ) {
    console.log("Connected to database.");
  }
});

module.exports = {
  sequelize: sequelize,
  Sequelize: Sequelize,
  User: User
};
