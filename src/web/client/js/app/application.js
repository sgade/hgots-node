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
    version: "0.0.0"
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
   App.ApplicationController = Ember.ObjectController.extend({
     _a: false,
     isPrivileged: function() {
       this.priviledgeUpdater();
       return this.get('_a');
     }.property('_a'),
     
     // updates the isPrivileged property based on the /user object.
     priviledgeUpdater: function() {
       var self = this;
       
       return Ember.$.get('/user').then(function(user) {
         console.log("user:", user);
         
         var isUser = true;
         if ( user && user.type ) {
           isUser = ( user.type === 'user' );
         }
         self.set('_a', !isUser);
       });
     }
   });
}());
