App.User = DS.Model.extend({
  username: DS.attr('string'),
  type: DS.attr('string'),
  
  // only for saving:
  password: DS.attr('string')
});
