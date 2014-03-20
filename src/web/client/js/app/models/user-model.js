/* App.User = DS.Model.extend({
  username: DS.attr('string'),
  password: DS.attr('string'),
  type: DS.attr('string')
}); */
App.User = Ember.Object.extend({});
App.User.reopenClass({
  findAll: function() {
    return $.getJSON('/api/v1/users').then(function(response) {
      return response;
    });
  },
  find: function(id) {
    return $.getJSON('/api/v1/user/' + id).then(function(response) {
      return response;
    });
  }
});
