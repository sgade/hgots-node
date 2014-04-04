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
  this.resource('admin');
  /* TODO: may specify sub-routes for specific users to be shown to the admin */
  
  this.route('about');
  this.route('readme');
});
