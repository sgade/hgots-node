(function() {
  "use strict";
  
  var userTypes = [ "User", "Controller", "Admin" ];
  
  App.AdminRoute = Ember.Route.extend({
    model: function() {
      return this.store.findAll('user');
    }
  });
  App.AdminController = Ember.ArrayController.extend({
    sortProperties: [ 'type', 'username' ],
    sortAscending: true,
    
    searchText: '',
    
    rightPanelTop: 0,
    rightPanelStyle: function() {
      return "margin-top: " + this.get('rightPanelTop') + "px";
    }.property("rightPanelTop"),
    
    init: function() {
      this._super();
      this.registerScrollHandler();
    },
    registerScrollHandler: function() {
      var self = this;
      $(window).on('scroll', function() {
        if ( window.innerWidth >= 992 ) {
          var navbarHeight = $(".navbar").height();
          var scrollY = window.scrollY;
          var offset = ( scrollY > navbarHeight ) ? ( scrollY - navbarHeight ) : 0;
          
          self.set('rightPanelTop', offset);
        } else {
          self.set('rightPanelTop', 0);
        }
      });
    },
    
    _filterModel: function() {
      var model = null;
      
      var search = this.get('searchText');
      if ( search ) {
        search = search.toLowerCase();
        model = this.get('content').filter(function(item, index, enumerable) {
          var username = item.get('username').toLowerCase();
          return username.indexOf(search) != -1;
        });
      } else {
        model = this.get('content');
      }
      
      this.set('filteredModel', model);
      
      return model;
    },
    onFilteredModelBaseChange: function() {
      if ( this.get('filteredModel') === null ) {
        this._filterModel();
      } else {
        console.log("debounce");
        Ember.run.debounce(this, this._filterModel, 250);
      }
    }.observes('searchText', 'content.@each'),
    filteredModel: null,
    
    actions: {
      showUser: function(id) {
        this.transitionToRoute('admin.user', id);
      }
    }
  });
  
  App.PasswordStrengthView = Ember.View.extend({
    templateName: 'views/password-strength-view',
    
    password: '',
    passwordPlaceholder: '',
    
    _passwordScore: function() {
      var calc = function(pw) {
        var estimate = zxcvbn(pw);
        return estimate.score;
      };
      
      return calc(this.get('password'));
    }.property('password'),
    
    barClass: function() {
      var score = this.get('_passwordScore');
      return 'strength-bar score-' + score;
    }.property('_passwordScore')
  });
  
  App.AdminUsersListItemView = Ember.View.extend({
    templateName: 'views/admin-users-listitem-view',
    id: function() {
      return this.get('user.id');
    }.property('user.id'),
    username: function() {
      return this.get('user.username');
    }.property('user.username'),
    type: function() {
      return this.get('user.type');
    }.property('user.type'),
    
    classNameBindings: [ 'backgroundClass' ],
    backgroundClass: function() {
      var klass = '';
      
      var type = this.get('user.type');
      if ( type ) {
        if ( type == 'Admin' ) {
          klass = 'bg-primary';
        } else if ( type == 'Controller' )  {
          klass = 'bg-info';
        }
      }
      
      return klass;
    }.property('user.type'),
    
    
    click: function() {
      var userId = this.get('user.id');
      this.get('controller').send('showUser', userId);
      // this.get('controller').transitionToRoute('admin.user', this.get('user.id'));
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
    
    // user info
    userTypes: userTypes,
    newPassword: "",
    newPasswordRepeat: "",
    newType: null,
    newUsername: null,
    
    _onModelUpdater: function() {
      this.set('newType', this.get('model.type'));
      this.set('newUsername', this.get('model.username'));
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
      if ( this.get('newUsername') === null ) {
        this.set('newUsername', this.get('model.username'));
      }
      
      // changed type
      var isNewType = ( this.get('newType') !== this.get('model.type') );
      // new password
      var isNewPassword = false;
      if ( this.get('newPassword') ) {
        isNewPassword = ( this.get('newPassword') == this.get('newPasswordRepeat') );
      }
      // new username
      var isNewUsername = ( this.get('newUsername') !== this.get('model.username') );
      
      var changes = ( isNewType || isNewPassword || isNewUsername );
      return !changes;
    }.property('newPassword', 'newPasswordRepeat', 'newType', 'model.type', 'newUsername', 'model.username'),
    
    // cards
    usersCards: function() {
      return this.get('model.cards');
    }.property('model.cards'),
    
    actions: {
      // user info
      saveEdit: function() {
        var user = this.get('model');
        
        var oldUsername = user.get('username');
        var oldType = user.get('type');
        
        user.set('username', this.get('newUsername'));
        user.set('password', this.get('newPassword'));
        user.set('type', this.get('newType'));
        
        this.set('newUsername', user.get('username'));
        this.set('newPassword', '');
        this.set('newPasswordRepeat', '');
        this.set('newType', user.get('type'));
        
        var self = this;
        user.save().then(function() {
          // silent
        }, function() {
          user.set('username', oldUsername);
          self.set('newUsername', oldUsername);
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
      },
      
      // cards
      newRFID: "",
      _newRFIDUpdater: function() {
        this.set('newRFID', '');
      }.observes('model'),
      addCardDisabled: function() {
        return ( this.get('newRFID') === "" );
      }.property('newRFID'),
      
      removeCardAssociation: function(card) {
        card.destroyRecord().then(function() {
          // silent, everything's just great!
        }, function() {
          alert("Card could not be removed.");
        });
      },
      getRFIDFromServer: function() {
        var self = this;
        
        $("#button-getRFID").button('loading');
        return Ember.$.get('/get_rfid', function(data) {
          $("#button-getRFID").button('reset');
          
          self.set('newRFID', data);
        });
      },
      addRFIDCard: function() {
        var self = this;
        
        var card = self.store.createRecord('card', {
          uid: self.get('newRFID'),
          user: self.get('model')
        });
        return card.save().then(function() {
          self.set('newRFID', '');
        }, function() {
          alert("Erorr adding the card.");
        });
      }
    }
  });
  
}());
