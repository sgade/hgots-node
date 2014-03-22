/**
 * The main database module.
 * @module db/index
 * @author Sören Gade
 *
 * @requires sequelize
 * */

var config = require('../config');
var crypt = require('../crypto/');
var fs        = require('fs'),
    path      = require('path'),
    Sequelize = require('sequelize'),
    lodash    = require('lodash'),
    db        = {};

var sequelize = new Sequelize(config.db.name, config.db.username, config.db.password, {
  dialect: 'sqlite',
  storage: config.db.name,
  
  logging: ( lodash.contains(['production', 'test'], process.env.NODE_ENV) ) ? false : console.log
});

var dirname = __dirname + "/models";

fs.readdirSync(dirname).filter(function(file) {
  return (file.indexOf('.') !== 0) && (file !== 'index.js');
}).forEach(function(file) {    
  var model = sequelize.import(path.join(dirname, file));
  db[model.name] = model;
});
 
Object.keys(db).forEach(function(modelName) {
  if ('associate' in db[modelName]) {
    db[modelName].associate(db);
  }
});

var initDB = function(done) {
  // TODO remove force: true
  sequelize.sync({force: true}).complete(function(err) {
    if ( !err ) {
      if(!lodash.contains(['production', 'test'], process.env.NODE_ENV)) {
        console.log("Connected to database.");
      }
    
      if(process.env.NODE_ENV !== 'test') {
        // Dummy data
        db.User.findOrCreate({
          username: 'test',
          password: crypt.encrypt('test'),
          type: 'admin'
        }).success(function(userTest) {
      
          db.Card.findOrCreate({
            uid: '6040082934'
          }).success(function(cardTest) {
            userTest.addCard(cardTest);
            done();
          });
      
        });
      } else {
        done();
      }
    }
  });
};

module.exports = lodash.extend({
  sequelize: sequelize,
  Sequelize: Sequelize,
  init: initDB
}, db);
