hgots.config([ '$translateProvider', function($translateProvider) {
  
  $translateProvider.translations('en_US', {
    SEARCH: 'Search',
    TYPE: {
      ADMIN: 'Admin',
      CONTROLLER: 'Controller',
      USER: 'User'
    },
    
    NAV: {
      HOME: 'Home',
      ADMIN: 'Admin',
      ACCESS_LOGS: 'Access logs',
      ABOUT: 'About',
      LOGOUT: 'Logout'
    },
    HOME: {
      OPEN_DOOR: 'Open Door',
      ERROR: 'Error opening the door: {{err}}.\nWe\'re sorry.'
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
      NO_LOG_FOUND: 'No log was found for that date.',
      APP_WAS_STARTED: 'The application was started at this point.'
    },
    ADMIN: {
      USERS: 'Users',
      NO_USERS_FOUND: 'No users found.',
      CREATE_NEW: 'Create new user',
      
      USERNAME: 'Username',
      TYPE: 'Type',
      PASSWORD: 'Password',
      PASSWORD_REPEAT: 'Repeat password',
      
      // Welcome
      WELCOME: {
        HEADER: 'Welcome to the Administration Interface',
        P_1: 'This is your home for managing who has access to this system.',
        P_2: 'All the users that have access to this system are listed in the list.',
        P_3: {
          YOU_CAN: 'You can',
          CREATE: 'create',
          END: 'new users and edit existing ones in the list.'
        },
        THREE_TYPES: {
          INTRO: 'There are three different user types',
          ADMIN: 'Has full rights. He can create new users, controllers and admins. Can open the door.',
          CONTROLLER: 'Has rights to create new users. Can open the door.',
          USER: 'Can open the door.'
        },
        QUESTIONS: 'If you have any questions, see'
      },
      // New User
      NEW: {
        HEADER: 'New user',
        CREATE: 'Create'
      },
      // User page
      USER: {
        YOU: 'You',
        USER_INFO: 'User info',
        SAVE: 'Save',
        DELETE: 'Delete',
        ASSOCIATED_CARDS: 'Associated cards',
        NEW_RFID_TAG: 'New RFID tag',
        GET_FROM_RFID: 'Get tag from RFID reader...',
        ADD: 'Add',
        REMOVE: 'Remove'
      }
    }
  });
  $translateProvider.determinePreferredLanguage();
  $translateProvider.fallbackLanguage('en_US');
  
}]);
