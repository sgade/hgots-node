var hgots = angular.module('HGOTSApp', [ 'ngRoute', 'ngAnimate', 'HGOTSServices', 'HGOTSAdmin', 'angular-loading-bar', 'ngActivityIndicator', 'pascalprecht.translate', 'ui.router' ]);

hgots.config([ '$locationProvider', '$stateProvider', '$urlRouterProvider', 'cfpLoadingBarProvider', function($locationProvider, $stateProvider, $urlRouterProvider, cfpLoadingBarProvider) {
  
  $locationProvider.html5Mode(false).hashPrefix('');
  
  // routes
  $stateProvider
    .state('home', {
      url: '/',
      templateUrl: 'views/home.html'
    })
    .state('admin', {
      url: '/admin',
      templateUrl: 'views/admin.html'
    })
    .state('admin.new', {
      url: '/admin/new',
      templateUrl: 'views/admin-new.html'
    })
    .state('admin.user', {
      url: '/admin/user/:userId',
      templateUrl: 'views/admin-user.html'
    })
    .state('logs', {
      url: '/logs',
      templateUrl: 'views/logs.html'
    })
    .state('about', {
      url: '/about',
      templateUrl: 'views/about.html'
    });
  $urlRouterProvider.otherwise('/');
  
  // loading bar
  cfpLoadingBarProvider.includeSpinner = false;
}]);

hgots.service('AppShared', [ '$http', function($http) {
  var obj = {
    currentUser: {},
    pkg: {
      name: '...',
      version: 'v0.0.0'
    }
  };
  // fill object with data from server
  obj.currentUser = $http({ method: 'GET', url: '/api/v2/user' }).then(function(currentUser) {
    obj.currentUser = currentUser.data.user;
  });
  $http({ method: 'GET', url: '/info' }).then(function(response) {
    obj.pkg = response.data;
  });
  
  return obj;
}]);
