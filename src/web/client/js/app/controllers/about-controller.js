(function() {
  "use strict";
  
  App.AboutController = Ember.Controller.extend({
    needs: [ "application" ],
    
    pkg: function() {
      return this.get('controllers.application.pkg');
    }.property('controllers.application.pkg'),
    versionLinkToGithub: function() {
      var version = this.get('pkg.version');
      if ( version === '0.0.0' ) {
        return "https://github.com/sgade/hgots-node/releases";
      }
      return "https://github.com/sgade/hgots-node/releases/tag/v" + version;
    }.property('pkg')
  });
}());
