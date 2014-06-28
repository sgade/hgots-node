hgots.config([ '$translateProvider', function($translateProvider) {
  
  $translateProvider.translations('en_US', {
    SEARCH: 'Search',
    
    NAV: {
      HOME: 'Home',
      ADMIN: 'Admin',
      ACCESS_LOGS: 'Access logs',
      ABOUT: 'About',
      LOGOUT: 'Logout'
    },
    HOME: {
      OPEN_DOOR: 'Open Door'
    },
    ABOUT: {
      VERSION: 'Version',
      GO_TO_GITHUB: 'Go tothe release page of this version on Github',
      BY: 'By',
      WITH_HELP_OF_THESE: 'with the help of these',
      CONTRIBUTORS: 'contributors',
      VISIT_THE: 'Visit the',
      GITHUB_REPOSITORY: 'Github Repository'
    },
    LOGS: {
      RESULTS: 'results',
      NO_LOG_FOUND: 'No log was found for that date.'
    }
  });
  $translateProvider.determinePreferredLanguage();
  
  console.log($translateProvider.preferredLanguage());
  
}]);
