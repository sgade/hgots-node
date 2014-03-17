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
  
  this.route('about');
});
