var hgots = angular.module('HGOTSApp', [ 'ngRoute', 'ngAnimate', 'HGOTSServices', 'HGOTSAdmin', 'angular-loading-bar' ]);

hgots.config(['$routeProvider', 'cfpLoadingBarProvider', function($routeProvider, cfpLoadingBarProvider) {
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

hgots.controller('NavbarController', [ '$scope', '$http', 'AppShared', '$window', function($scope, $http, AppShared, $window) {
  // Navbar itself
  $scope.currentUserIsPrivileged = false;
  $scope.$watch(function() { return AppShared.currentUser; }, function(user) {
    $scope.currentUserIsPrivileged = ( !!user && !!user.type && user.type !== "User" );
  });
  
  // Loading bar, related to navbar
  $(function() {
    // onload
    var className = 'scrolled';
    var body = $(document.body);
    var navbarHeight = $(".navbar").height();
    
    $(window).on('scroll', function() {
      var scrollY = $window.scrollY;
      
      if ( scrollY > 0 && !body.hasClass(className) ) {
        console.log("scrolled");
        body.addClass(className);
      } else if ( scrollY === 0 && body.hasClass(className) ) {
        console.log("not");
        body.removeClass(className);
      }
      
      if ( !body.hasClass(className) || scrollY >= navbarHeight ) {
        $("#loading-bar .bar").css('top', '');
      } else {
        if ( scrollY < navbarHeight ) {
          // keep the indicator at the level until navbar is away
          $("#loading-bar .bar").css('top', ( navbarHeight - scrollY ) + "px");
        } 
      }
    });
  });
}]);
