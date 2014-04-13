(function() {
  "use strict";
  
  var userTypes = [ "User", "Controller", "Admin" ];
  
  App.AdminRoute = Ember.Route.extend({
    model: function() {
      return this.store.findAll('user');
    }
  });
  
  App.AdminController = Ember.ArrayController.extend({
    actions: {
      showUser: function(id) {
        this.transitionToRoute('admin.user', id);
      }
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
        var type = this.get('selectedUserType');

        console.log(username, password, type);
      
        var newUser = this.store.createRecord('user', {
          username: username,
          password: password,
          type: type
        });
        newUser.save().then(function() {
          alert("Created new user.");
        }, function() {
          alert("Error creating user.");
        });
        
        this.set('selectedUsername', "");
        this.set('selectedPassword', "");
        
        this.transitionToRoute('admin');
      }
    }
  });
  
  App.AdminUserController = Ember.ObjectController.extend({
    needs: [ 'application' ],
    
    userTypes: userTypes,
    newPassword: "",
    newPasswordRepeat: "",
    newType: null,
    
    _onModelUpdater: function() {
      this.set('newType', this.get('model.type'));
    }.property('model'),
    
    userIsSelf: function() {
      var shownUserUsername = this.get('model').get('username');
      
      var appController = this.get('controllers.application');
      var currentUser = appController.currentUser;
      if ( currentUser ) {
        return ( shownUserUsername == currentUser.username );
      }
      
      return false;
    }.property('model', 'controllers.application.currentUser'),
    canSeverelyEditThisUser: function() {
      var appCtrl = this.get('controllers.application');
      if ( appCtrl.currentUser ) {
        var user = this.get('model');
        
        return ( user.get('username') == appCtrl.currentUser.username );
      }
      
      return false;
    }.property('model', 'controllers.application.currentUser'),
    saveDisabled: function() {
      if ( this.get('newType') === null ) {
        this.set('newType', this.get('model.type'));
      }
      
      // changed type
      var isNewType = ( this.get('newType') !== this.get('model.type') );
      // new password
      var isNewPassword = false;
      if ( this.get('newPassword') ) {
        isNewPassword = ( this.get('newPassword') == this.get('newPasswordRepeat') );
      }
      
      var changes = ( isNewType || isNewPassword );
      return !changes;
    }.property('newPassword', 'newPasswordRepeat', 'newType', 'model.type'),
    
    actions: {
      saveEdit: function() {
        var user = this.get('model');
        
        var oldType = user.get('type');
        
        user.set('password', this.get('newPassword'));
        user.set('type', this.get('newType'));
        
        this.set('newPassword', '');
        this.set('newPasswordRepeat', '');
        this.set('newType', user.get('type'));
        
        var self = this;
        user.save().then(function() {
          alert("Changes saved.");
        }, function() {
          user.set('type', oldType);
          self.set('newType', oldType);
          
          alert("Error saving changes.");
        });
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
