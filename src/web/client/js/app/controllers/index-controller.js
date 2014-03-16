App.IndexController = Ember.ObjectController.extend({
  isLoading: false,
  
  actions: {
    openDoor: function() {
      var self = this;
      self.set('isLoading', true);
      
      // TODO request to open the door
      setTimeout(function() {
        self.set('isLoading', false);
      }, 1000);
    }
  }
});
