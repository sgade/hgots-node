var hgotsAdmin = angular.module('HGOTSAdmin', [ 'HGOTSApp', 'HGOTSServices', 'PasswordStrengthView' ]);

hgotsAdmin.service('AdminShared', [ '$http', '$state', 'AppShared', function($http, $state, AppShared) {
  var obj = {
    userTypes: [ 'User', 'Controller', 'Admin' ],
    showUser: function(user) {
      if ( !!user ) {
        console.log("transition");
        $state.transitionTo('admin.user', {
          userId: user.id
        });
      } else {
        $state.transitionTo('admin.welcome');
      }
    },
    currentUser: AppShared.currentUser,
    
    // variable
    selectedUser: null
  };
  
  return obj;
}]);
hgotsAdmin.controller('AdminController', [ '$scope', '$stateParams', '$window', '$location', 'User', 'AdminShared', '$state', function($scope, $stateParams, $window, $location, User, AdminShared, $state) {
  $scope.users = User.query(function() {
    if ( !!AdminShared.selectedUser ) {
      console.log(AdminShared.selectedUser);
      var filteredList = $scope.users.filter(function(user) {
        return ( user.id === parseInt(AdminShared.selectedUser.id) );
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
    AdminShared.selectedUser = user;
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
