App.IndexController = Ember.ObjectController.extend({
  isLoading: false,
  isDisabled: false,
  
  actions: {
    openDoor: function() {
      var self = this;
      self.set('isLoading', true);
      self.set('isDisabled', true);
      
      $.get('/open_door', function() {
        self.set('isLoading', false);
        // prevent spamming:
        setTimeout(function() {
          self.set('isDisabled', false);
        }, 5000);
      });
    }
  }
});
