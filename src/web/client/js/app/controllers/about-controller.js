(function() {
  "use strict";
  
  App.AboutController = Ember.Controller.extend({
    needs: [ "application" ],
    
    pkg: function() {
      return this.get('controllers.application.pkg');
    }.property('controllers.application.pkg')
  });
}());
