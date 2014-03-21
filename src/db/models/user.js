var Sequelize = require('sequelize');

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
    }
  });
  
  return User;
};
