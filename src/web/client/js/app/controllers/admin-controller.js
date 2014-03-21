App.AdminRoute = Ember.Route.extend({
  model: function() {
    return this.store.findAll('user');
  }
});
App.AdminController = Ember.ArrayController.extend({
  actions: {
    createNewUser: function() {
      var username = $("#createNewUser #newuser-username").val();
      var password = $("#createNewUser #newuser-password").val();
      var type = $("#createNewUser #newuser-type").val();
      
      console.log(username, password, type);
      
      this.store.createRecord('user', {
        username: username,
        password: password,
        type: type
      });
    }
  }
});
