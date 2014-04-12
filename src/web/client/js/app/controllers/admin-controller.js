(function() {
  "use strict";
  
  var userTypes = [ "User", "Controller", "Admin" ];
  
  App.AdminRoute = Ember.Route.extend({
    model: function() {
      return this.store.findAll('user');
    }
  });
  
  App.AdminUserRoute = Ember.Route.extend({
    model: function(params) {
      return this.store.find('user', params.userid);
    }
  });
  
  App.AdminNewController = Ember.ArrayController.extend({
    userTypes: userTypes,
    selectedUserType: 'User',
    selectedUsername: '',
    selectedPassword: '',
        
    actions: {
      cancelNewUser: function() {
        this.set('selectedUsername', "");
        this.set('selectedPassword', "");
        
        this.transitionToRoute('admin');
      },
      createNewUser: function() {
        var username = this.get('selectedUsername');
        var password = this.get('selectedPassword');
        var type = this.get('selectedUserType').toLowerCase();

        console.log(username, password, type);
      
        this.store.createRecord('user', {
          username: username,
          password: password,
          type: type
        }).save();
        
        this.set('selectedUsername', "");
        this.set('selectedPassword', "");
        
        this.transitionToRoute('admin');
      }
    }
  });
  
  App.AdminUserController = Ember.ObjectController.extend({
    needs: [ 'application' ],
    
    userTypes: userTypes,
    
    userIsSelf: function() {
      var shownUserUsername = this.get('model').get('username');
      
      var appController = this.get('controllers.application');
      var currentUser = appController.currentUser;
      if ( currentUser ) {
        return ( shownUserUsername == currentUser.username );
      }
      
      return false;
    }.property('model', 'controllers.application.currentUser'),
    
    actions: {
      saveEdit: function() {
        var user = this.get('model');
        console.log(user, user.get('type'));
        
        user.save();
      },
      delete: function() {
        var user = this.get('model');
        
        user.destroyRecord();
        // TODO: only after promise returned
        this.transitionToRoute('admin.index');
      }
    }
  });
  
}());
