App = Ember.Application.create();

App.Router.map(function() {
  this.resource('admin');
  this.resource('operator');
  
  this.route('about');
});
