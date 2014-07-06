var hgotsAdmin = angular.module('HGOTSAdmin', [ 'HGOTSApp', 'HGOTSServices', 'PasswordStrengthView' ]);

hgotsAdmin.service('AdminShared', [ '$http', '$location', 'AppShared', function($http, $location, AppShared) {
  var obj = {
    userTypes: [ 'User', 'Controller', 'Admin' ],
    showUser: function(user) {
      if ( !!user ) {
        $location.path('/admin/user/' + user.id);
      } else {
        $location.path('/admin');
      }
    },
    currentUser: AppShared.currentUser,
    
    // variable
    selectedUser: {}
  };
  
  return obj;
}]);
hgotsAdmin.controller('AdminController', [ '$scope', '$routeParams', '$window', '$location', 'User', 'AdminShared', function($scope, $routeParams, $window, $location, User, AdminShared) {
  $scope.getIncludeFile = function() {
    var retVal = "views/admin-";
    
    if ( !!$routeParams.new ) {
      retVal += "new";
    } else if ( !!$routeParams.userId ) {
      retVal += "user";
    } else {
      retVal += "welcome";
    }
    
    return retVal + ".html";
  };
  $scope.includeFile = $scope.getIncludeFile();
  
  $scope.users = User.query(function() {
    if ( $scope.includeFile.indexOf("user") != -1 ) {
      
      var filteredList = $scope.users.filter(function(user) {
        return ( user.id === parseInt($routeParams.userId) );
      });
      
      if ( filteredList.length === 1 ) {
        AdminShared.selectedUser = filteredList[0];
      } else {
        console.error("User could not be found.");
      }
    }
  });
  $scope.ifSelectedUserStyle = function(user) {
    if ( !!AdminShared.selectedUser ) {
      if ( AdminShared.selectedUser === user ) {
        return "selected-user";
      }
    }
    
    return "";
  };
  
  $scope.showUser = function(user) {
    // redirect to page linked to in link, but on element click already
    AdminShared.showUser(user);
  };
  
  $scope.userTypeBackgroundStyle = function(user) {
    if ( user.type === "Admin" ) {
      return "bg-primary";
    } else if ( user.type === "Controller" ) {
      return "bg-info";
    }
  };
  
  $scope.infoPanelStyle = { "margin-top": "0px" };
  // little scroll "hack"
  $($window).on('scroll', function() {
    var oldOffset = parseInt($scope.infoPanelStyle["margin-top"]);
    var newOffset = oldOffset || 0;
    
    // this needs a certain min width b/c of the responsive layout
    if ( $window.innerWidth >= 992 ) {
      var navbar = $(".navbar");
      var navbarHeight = navbar.height();
      var navbarMarginBottom = parseInt(navbar.css('margin-bottom'));
      var adminInfoPanelHeight = $('.admin-scroll-info').height();
      
      // a minimum height is required, otherwise the controls hide
      var minHeight = navbarHeight + navbarMarginBottom + adminInfoPanelHeight;
      
      if ( $window.innerHeight > minHeight ) {
        var scrollY = $window.scrollY;
        //newOffset = ( scrollY > navbarHeight ) ? ( scrollY - navbarHeight ) : 0;
        newOffset = scrollY - navbarHeight;
      }
    }
    
    newOffset = ( newOffset >= 0 ) ? newOffset : 0;
    if ( newOffset !== oldOffset ) {
      $scope.infoPanelStyle = { "margin-top": newOffset + "px" };
      $scope.$apply();
    }
  });
}]);
