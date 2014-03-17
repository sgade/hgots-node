/**
 * The main database module.
 * @module db/index
 * @author Sören Gade
 *
 * @requires sequelize
 * */

var config = require('../config');
var Sequelize = require('sequelize');

var sequelize = new Sequelize(config.db.name, config.db.username, config.db.password, {
  dialect: 'sqlite',
  storage: config['db-name']
});

// models
var User = require('./models/user')(sequelize);

// TODO remove force: true
sequelize.sync(true).complete(function(err) {
  if ( !err ) {
    console.log("Connected to database.");
    
    // Dummy data
    User.create({
      username: 'test',
      password: 'test',
      type: 'admin'
    });
  }
});

module.exports = {
  sequelize: sequelize,
  Sequelize: Sequelize,
  User: User
};
