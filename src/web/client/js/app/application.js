var hgots = angular.module('HGOTSApp', [ 'ngRoute' ]);

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
    .when('/about', {
      templateUrl: 'views/about.html',
      controller: 'AboutController'
    })
    .otherwise({
      redirectTo: '/'
    });
}]);

hgots.controller('NavbarController', [ '$scope', '$http', function($scope, $http) {
  $scope.currentUserIsPrivileged = false;
  $http({ method: 'GET', url: '/user' }).then(function(user) {
    $scope.currentUserIsPrivileged = ( user.type !== "User" );
  }, function(err) {
    console.log("Error retrieving user object:", err);
  });
}]);
