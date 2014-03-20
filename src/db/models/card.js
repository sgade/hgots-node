var Sequelize = require('sequelize');

module.exports = function(sequelize, DataTypes) {
  
  var Card = sequelize.define('Card', {
    uid: DataTypes.STRING
  }, {
    classMethods: {
      associate: function(models){
        Card.belongsTo(models.User);
      }
    }
  });
  
  return Card;
};
