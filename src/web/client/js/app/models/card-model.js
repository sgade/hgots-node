App.Card = DS.Model.extend({
  uid: DS.attr('string'),
  user: DS.belongsTo('user')
});
