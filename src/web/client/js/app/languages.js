hgots.config([ '$translateProvider', function($translateProvider) {
  
  $translateProvider.translations('en_US', {    
    NAV: {
      HOME: 'Home',
      ADMIN: 'Admin',
      ACCESS_LOGS: 'Access logs',
      ABOUT: 'About',
      LOGOUT: 'Logout'
    },
    HOME: {
      OPEN_DOOR: 'Open Door'
    }
  });
  $translateProvider.determinePreferredLanguage();
  
  console.log($translateProvider.preferredLanguage());
  
}]);
