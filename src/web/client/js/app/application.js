App = Ember.Application.create();

App.Store = DS.Store;

App.Router.map(function() {
  this.resource('admin');
  this.resource('operator');
  
  this.route('about');
});
