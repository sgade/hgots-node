var hgotsAdmin = angular.module('HGOTSAdmin', [ 'HGOTSApp', 'HGOTSServices', 'PasswordStrengthView' ]);

hgotsAdmin.service('AdminShared', [ '$http', '$state', 'AppShared', function($http, $state, AppShared) {
  var obj = {
    userTypes: [ 'User', 'Controller', 'Admin' ],
    showUser: showUser,
    currentUser: AppShared.currentUser,
    
    // variable
    selectedUser: null
  };
  function showUser(user) {
    if ( !!user ) {
      console.log("transition");
      $state.transitionTo('admin.user', {
        userId: user.id
      });
    } else {
      $state.transitionTo('admin.welcome');
    }
    obj.selectedUser = user;
  }
  
  return obj;
}]);
hgotsAdmin.controller('AdminController', [ '$scope', '$stateParams', '$window', '$location', 'User', 'AdminShared', '$state', function($scope, $stateParams, $window, $location, User, AdminShared, $state) {
  $scope.$watch(function() {
    return AdminShared.selectedUser;
  }, function(newValue, oldValue) {
    if ( newValue === null && newValue !== oldValue ) {
      // we may have deleted a user, let's reload
      $scope.updateUserList();
    }
  });
  $scope.updateUserList = function() {
    userList = User.query(function() {
      if ( !!AdminShared.selectedUser ) {
        var filteredList = userList.filter(function(user) {
          return ( user.id === parseInt(AdminShared.selectedUser.id) );
        });
        
        if ( filteredList.length === 1 ) {
          if ( AdminShared.selectedUser.id != filteredList[0].id ) {
            AdminShared.selectedUser = filteredList[0];
          }
        } else {
          console.error("User could not be found.");
          $state.transitionTo('admin.welcome');
        }
      }
    });
    
    $scope.users = userList;
  };
  $scope.updateUserList();
  
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
