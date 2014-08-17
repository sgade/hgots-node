var hgots = angular.module('HGOTSApp', [ 'ngRoute', 'ngAnimate', 'HGOTSServices', 'HGOTSAdmin', 'angular-loading-bar', 'ngActivityIndicator', 'pascalprecht.translate', 'ui.router' ]);

hgots.config([ '$locationProvider', '$routeProvider', 'cfpLoadingBarProvider', function($locationProvider, $routeProvider, cfpLoadingBarProvider) {
  
  $locationProvider.html5Mode(false).hashPrefix('');
  
  // routes
  $routeProvider
    .when('/', {
      templateUrl: 'views/home.html',
      controller: 'HomeController'
    })
    .when('/admin', {
      templateUrl: 'views/admin.html',
      controller: 'AdminController'
    })
    .when('/admin/:new', {
      templateUrl: 'views/admin.html',
      controller: 'AdminController'
    })
    .when('/admin/user/:userId', {
      templateUrl: 'views/admin.html',
      controller: 'AdminController',
      reloadOnSearch: false
    })
    .when('/logs', {
      templateUrl: 'views/logs.html',
      controller: 'LogsController'
    })
    .when('/about', {
      templateUrl: 'views/about.html',
      controller: 'AboutController'
    })
    .otherwise({
      redirectTo: '/'
    });
  
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
