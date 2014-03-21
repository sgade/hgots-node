(function() {
  "use strict";
  
  App.AdminRoute = Ember.Route.extend({
    model: function() {
      return this.store.findAll('user');
    }
  });
  
  var clearNewUserInputFields = function() {
    $("#createNewUser input").val("");
    $("#createNewUser select").prop('selectedIndex', 0);
  };
  
  App.AdminController = Ember.ArrayController.extend({
    actions: {
      cancelNewUser: function() {
        clearNewUserInputFields();
      },
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
        
        clearNewUserInputFields();
      }
    }
  });
  
}());
