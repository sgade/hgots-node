var Sequelize = require('sequelize');
var lodash = require('lodash');

module.exports = function(sequelize, DataTypes) {
  
  var User = sequelize.define('User', {
    username: Sequelize.STRING,
    password: Sequelize.STRING,
    type: {
      type: Sequelize.ENUM,
      values: [ 'user', 'controller', 'admin' ]
    }
  }, {
    classMethods: {
      associate: function(models) {
        User.hasMany(models.Card);
      }
    },
    instanceMethods: {
      isPrivileged: function() {
        return lodash.contains(['controller', 'admin'], this.type);
      },
      isAdmin: function() {
        return this.type === 'admin';
      },
      isController: function() {
        return this.type === 'controller';
      }
    }
  });
  
  return User;
};
