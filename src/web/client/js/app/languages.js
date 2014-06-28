hgots.config([ '$translateProvider', function($translateProvider) {
  
  /*
   * ENGLISH
   * DEFAULT
   * */
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
      GO_TO_GITHUB: 'Go to the release page of this version on Github',
      BY: 'By',
      WITH_HELP_OF_THESE: 'with the help of these',
      CONTRIBUTORS: 'contributors',
      VISIT_THE: 'Visit the',
      GITHUB_REPOSITORY: 'Github Repository',
      FORCE_LANG: 'Force language to'
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
        GET_FROM_RFID: 'Get tag from RFID reader',
        ADD: 'Add',
        REMOVE: 'Remove',
        
        CONFIRM_DELETE_USER: 'Do you really want to delete {{username}}?',
        CONFIRM_DELETE_CARD: 'Do you really want to remove card "{{uid}}" from this user?'
      }
    }
  });
  $translateProvider.translations('de_DE', {
    SEARCH: 'Suche',
    TYPE: {
      ADMIN: 'Admin',
      CONTROLLER: 'Controller',
      USER: 'Benutzer'
    },
    
    NAV: {
      HOME: 'Start',
      ADMIN: 'Administrationsbereich',
      ACCESS_LOGS: 'Zugangsprotokolle',
      ABOUT: 'Über',
      LOGOUT: 'Abmelden'
    },
    HOME: {
      OPEN_DOOR: 'Tür öffnen',
      ERROR: 'Fehler beim Öffnen der Tür: {{err}}.\nDas tut uns leid.'
    },
    ABOUT: {
      VERSION: 'Version',
      GO_TO_GITHUB: 'Gehe zur Versionsseite auf Github',
      BY: 'Von',
      WITH_HELP_OF_THESE: 'zusammen mit diesen',
      CONTRIBUTORS: 'Helfern',
      VISIT_THE: 'Besuchen Sie das',
      GITHUB_REPOSITORY: 'Github Repository',
      FORCE_LANG: 'Erzwinge Sprache:'
    },
    LOGS: {
      RESULTS: 'Ergebnisse',
      NO_LOG_FOUND: 'Es wurde kein Log für dieses Datum gefunden.',
      APP_WAS_STARTED: 'Die Applikation ist an diesem Punkt gestartet.'
    },
    ADMIN: {
      USERS: 'Benutzer',
      NO_USERS_FOUND: 'Keine Benutzer gefunden.',
      CREATE_NEW: 'Neuen Benutzer erstellen',
      
      USERNAME: 'Benutzername',
      TYPE: 'Typ',
      PASSWORD: 'Passwort',
      PASSWORD_REPEAT: 'Passwort wiederholen',
      
      // Welcome
      WELCOME: {
        HEADER: 'Willkommen im Administrationsbereich',
        P_1: 'Hier können Sie verwalten, wer Zugang zu diesem System hat.',
        P_2: 'Alle Benutzer die Zugang haben sind in der Liste aufgeführt.',
        P_3: {
          YOU_CAN: '',
          CREATE: 'Erstellen',
          END: 'Sie neue Benutzer oder bearbeiten Sie vorhandende aus der Liste.'
        },
        THREE_TYPES: {
          INTRO: 'Es gibt drei Typen von Benutzern',
          ADMIN: 'Hat alle Rechte. Er kann neue Benutzer, Controller und Admins erstellen. Er kann die Tür öffnen.',
          CONTROLLER: 'Hat das Recht, neue Benutzer zu erstellen. Kann die Tür öffnen.',
          USER: 'Kann die Tür öffnen.'
        },
        QUESTIONS: 'Bei Fragen, gucken Sie bei'
      },
      // New User
      NEW: {
        HEADER: 'Neuer Benutzer',
        CREATE: 'Erstellen'
      },
      // User page
      USER: {
        YOU: 'Sie',
        USER_INFO: 'Benutzerinformationen',
        SAVE: 'Speichern',
        DELETE: 'Löschen',
        ASSOCIATED_CARDS: 'Verbundene Karten',
        NEW_RFID_TAG: 'Neuer RFID tag',
        GET_FROM_RFID: 'Vom RFID Leser lesen',
        ADD: 'Hinzufügen',
        REMOVE: 'Entfernen',
        
        CONFIRM_DELETE_USER: 'Möchten Sie wirklich den Benutzer "{{username}}" löschen?',
        CONFIRM_DELETE_CARD: 'Möchten Sie wirklich die Karte "{{uid}}" von diesem Benutzer entfernen?'
      }
    }
  });
  
  $translateProvider.registerAvailableLanguageKeys([ 'en_US', 'de_DE' ], {
    'en': 'en_US',
    'en_UK': 'en_US',
    'de': 'de_DE',
    'de_CH': 'de_DE'
  });
  // default language is english
  $translateProvider.fallbackLanguage('en_US');
  // determine language
  $translateProvider.determinePreferredLanguage();
}]);
