App.User = DS.Model.extend({
  username: DS.attr('string'),
  password: DS.attr('string'),
  type: DS.attr('string'),
  updatedAt: DS.attr('date'),
  createdAt: DS.attr('date')
});
