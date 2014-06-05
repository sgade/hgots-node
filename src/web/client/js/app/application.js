var hgots = angular.module('HGOTSApp', [ 'ngRoute', 'HGOTSAdmin' ]);

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
      controller: 'AdminController'
    })
    .when('/about', {
      templateUrl: 'views/about.html',
      controller: 'AboutController'
    })
    .otherwise({
      redirectTo: '/'
    });
}]);

hgots.controller('NavbarController', [ '$scope', '$http', 'AdminShared', function($scope, $http, AdminShared) {
  $scope.currentUserIsPrivileged = false;
  $scope.$watch(function() {
    return AdminShared.currentUser;
  }, function(user) {
    $scope.currentUserIsPrivileged = ( user.type !== "User" );
  });
}]);
