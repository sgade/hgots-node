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
  storage: config.db.name,
  
  logging: ( process.env.NODE_ENV === 'production' ) ? false : console.log
});

// models
var User = require('./models/user')(sequelize);
var Card = require('./models/Card')(sequelize);
// associations
User.hasMany(Card, {
  as: 'Cards'
});
Card.belongsTo(User);

// TODO remove force: true
sequelize.sync({ force: true }).complete(function(err) {
  if ( !err ) {
    console.log("Connected to database.");
    
    // Dummy data
    User.create({
      username: 'test',
      password: 'test',
      type: 'admin'
    }).success(function(userTest) {
      
      Card.create({
        uid: 'test'
      }).success(function(cardTest) {
        userTest.addCard(cardTest);
      });
      
    });
  }
});

module.exports = {
  sequelize: sequelize,
  Sequelize: Sequelize,
  User: User,
  Card: Card
};
