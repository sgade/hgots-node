App.User = DS.Model.extend({
  username: DS.attr('string'),
  type: DS.attr('string'),
  cards: DS.hasMany('card'),
  
  // only for saving:
  password: DS.attr('string')
});
