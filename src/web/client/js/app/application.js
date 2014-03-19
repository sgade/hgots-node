// Application:
App = Ember.Application.create();

/* ==========
 * Store
 * ==========
 * */
App.Store = DS.Store;
// Fetch
App.ApplicationAdapter = DS.RESTAdapter.extend({
  namespace: 'api/v1'
});

/* ==========
 * Routing
 * ==========
 * */
App.Router.map(function() {
  this.resource('admin');
  /* TODO may specify sub-routes for specific users to be shown to the admin */
  
  this.route('about');
});
