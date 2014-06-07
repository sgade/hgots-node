var hgots = angular.module('HGOTSApp', [ 'ngRoute', 'ngAnimate', 'HGOTSAdmin' ]);

hgots.config(['$routeProvider', function($routeProvider) {
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
    .when('/about', {
      templateUrl: 'views/about.html',
      controller: 'AboutController'
    })
    .otherwise({
      redirectTo: '/'
    });
}]);

hgots.service('AppShared', [ '$http', function($http) {
  var obj = {
    currentUser: {},
    pkg: {}
  };
  // fill object with data from server
  obj.currentUser = $http({ method: 'GET', url: '/api/v2/user' }).then(function(currentUser) {
    obj.currentUser = currentUser.data.user;
  });
  obj.pkg = $http({ method: 'GET', url: '/info' }).then(function(response) {
    obj.pkg = response.data;
  });
  
  return obj;
}]);

hgots.controller('NavbarController', [ '$scope', '$http', 'AppShared', function($scope, $http, AppShared) {
  $scope.currentUserIsPrivileged = false;
  $scope.$watch(function() { return AppShared.currentUser; }, function(user) {
    $scope.currentUserIsPrivileged = ( !!user && !!user.type && user.type !== "User" );
  });
}]);
