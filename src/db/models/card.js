var Sequelize = require('sequelize');

module.exports = function(sequelize) {
  
  var Card = sequelize.define('Card', {
    uid: Sequelize.STRING
  });
  
  return Card;
};
