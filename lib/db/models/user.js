var Sequelize = require('sequelize');
var lodash = require('lodash');

module.exports = function(sequelize, DataTypes) {
  
  var User = sequelize.define('User', {
    username: Sequelize.STRING,
    password: Sequelize.STRING,
    type: {
      type: Sequelize.ENUM,
      values: [ 'User', 'Controller', 'Admin' ],
      defaultValue: 'User'
    }
  }, {
    classMethods: {
      associate: function(models) {
        User.hasMany(models.Card);
      }
    },
    instanceMethods: {
      isPrivileged: function() {
        return lodash.contains(['Controller', 'Admin'], this.type);
      },
      isAdmin: function() {
        return this.type === 'Admin';
      },
      isController: function() {
        return this.type === 'Controller';
      },
      getPublicModel: function() {
        return {
          id: this.id,
          username: this.username,
          type: this.type
        };
      }
    }
  });
  
  return User;
};
