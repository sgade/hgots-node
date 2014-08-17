var hgots = angular.module('HGOTSApp', [ 'ngRoute', 'ngAnimate', 'HGOTSServices', 'HGOTSAdmin', 'angular-loading-bar', 'ngActivityIndicator', 'pascalprecht.translate', 'ui.router' ]);

hgots.config([ '$locationProvider', '$stateProvider', '$urlRouterProvider', 'cfpLoadingBarProvider', function($locationProvider, $stateProvider, $urlRouterProvider, cfpLoadingBarProvider) {
  
  $locationProvider.html5Mode(false).hashPrefix('');
  
  // routes
  $stateProvider
    .state('home', {
      url: '/',
      templateUrl: 'views/home.html',
      controller: 'HomeController'
    })
    .state('admin', {
      abstract: true,
      url: '/admin',
      templateUrl: 'views/admin.html',
      controller: 'AdminController'
    })
      .state('admin.welcome', {
        url: '/admin',
        templateUrl: 'views/admin-welcome.html',
        controller: 'AdminController'
      })
      .state('admin.new', {
        url: '/new', // /admin/new
        templateUrl: 'views/admin-new.html',
        controller: 'AdminNewController'
      })
      .state('admin.user', {
        url: '/user/:userId', // /admin/user/:userId
        templateUrl: 'views/admin-user.html',
        controller: 'AdminUserController'
      })
    .state('logs', {
      url: '/logs',
      templateUrl: 'views/logs.html',
      controller: 'LogsController'
    })
    .state('about', {
      url: '/about',
      templateUrl: 'views/about.html',
      controller: 'AboutController'
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
