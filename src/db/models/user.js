var Sequelize = require('sequelize');
var lodash = require('lodash');

module.exports = function(sequelize, DataTypes) {
  
  var User = sequelize.define('User', {
    username: Sequelize.STRING,
    password: Sequelize.STRING,
    openid: Sequelize.STRING,
    type: {
      type: Sequelize.ENUM,
      values: [ 'user', 'controller', 'admin' ],
      defaultValue: 'user'
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
