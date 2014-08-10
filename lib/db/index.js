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
  
  //logging: ( lodash.contains(['production', 'test'], process.env.NODE_ENV) ) ? false : console.log
  logging: false
});

var dirname = path.join(__dirname, "models");

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
  var force = ( process.env.NODE_ENV !== 'production' );
  // TODO: remove force: true
  sequelize.sync({force: force}).complete(function(err) {
    if ( !err ) {
      if(!lodash.contains(['production', 'test'], process.env.NODE_ENV)) {
        console.log("Connected to database.");
      }
    
      if ( process.env.NODE_ENV === 'production' ) {
        defaultData(done);
      } else if ( process.env.NODE_ENV === 'test' ) {
        done(null);
      } else {
        sampleData(done);
      }
    }
  });
};

var defaultData = function(callback) {
  callback = callback || function() {};
  
  // default login
  db.User.count().complete(function(err, count) {
    if ( !!err ) {
      return callback(err);
    }
    
    if ( count > 0 ) {
      callback(null);
    } else {
      db.User.create({
        username: 'admin',
        password: crypt.encrypt('admin'),
        type: 'Admin'
      }).complete(function(err, user) {
        if ( !!err ) {
          return callback(err);
        }
        
        console.log("Default admin login created.");
        callback(null);
      });
    }
  });
};

var sampleData = function(callback) {
  callback = callback || function() {};
  
  // Dummy data
  db.User.findOrCreate({
    username: 'test',
    password: crypt.encrypt('test'),
    type: 'Admin'
  }).success(function(testAdmin) {

    db.Card.findOrCreate({
      uid: '6040082934'
    }).success(function(cardTest) {
      testAdmin.addCard(cardTest);
      
      db.User.findOrCreate({
        username: 'test-controller',
        password: crypt.encrypt('test'),
        type: 'Controller'
      }).success(function(testController) {
        db.User.findOrCreate({
          username: 'test-user',
          password: crypt.encrypt('test'),
          type: 'User'
        }).success(function(testUser) {
          
          var pw = crypt.encrypt('test');
          for ( var i = 0; i < 10; i++ ) {
            var dummy = "Dummy User " + ( i + 1 );
            db.User.findOrCreate({
              username: dummy,
              password: pw,
              type: 'User'
            });
          }
          
          console.log("Sample data loaded.");
          callback(null);
        });
      });
      
    });

  });
};

module.exports = lodash.extend({
  sequelize: sequelize,
  Sequelize: Sequelize,
  init: initDB
}, db);
