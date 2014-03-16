App.IndexController = Ember.ObjectController.extend({
  status: 'Ready',
  
  actions: {
    openDoor: function() {
      var self = this;
      self.set('status', 'Waiting...');
      
      // TODO request to open the door
      setTimeout(function() {
        self.set('status', 'Info: Not yet implemented.');
      }, 1000);
    }
  }
});
