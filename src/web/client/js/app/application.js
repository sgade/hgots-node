App = undefined;

(function() {
  "use strict";
  
  // Application:
  App = Ember.Application.create();

  /* ==========
   * Globals
   * ==========
   * */
  App.Globals = {
    title: "HGO Türschloss",
    version: "0.1.0"
  };

  /* ==========
   * Store
   * ==========
   * */
  // Fetch
  App.ApplicationAdapter = DS.RESTAdapter.extend({
    namespace: 'api/v1'
  });
  App.Store = DS.Store.extend({
    adapter: 'App.ApplicationAdapter'
  });

  /* ==========
   * Routing
   * ==========
   * */
  App.Router.reopen({
    rootURL: '/app'
  });
  App.Router.map(function() {
    this.resource('admin', function() {
      /* TODO: may specify sub-routes for specific users to be shown to the admin */
      this.route('new');
      this.route('user', {
        path: '/user/:userid'
      });
    });
    
    this.route('about');
    this.route('readme');
  });
  
  /*
   * ==========
   * Global controller
   * ==========
   * */
   // dirty:
   App.ApplicationController = Ember.ObjectController.extend({
     currentUser: null,
     
     isCurrentUserPrivileged: function() {
       var status = false;
       
       var user = this.get('currentUser');
       if ( user && user.type ) {
         status = ( user.type !== 'User' );
       }
       
       return status;
     }.property('currentUser'),
     
     init: function() {
       this._super();
       
       this.loadCurrentUser();
     },
     loadCurrentUser: function() {
       var self = this;
       
       return Ember.$.get('/user').then(function(user) {
         self.set('currentUser', user);
       });
     }
   });
}());
