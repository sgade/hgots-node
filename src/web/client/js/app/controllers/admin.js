var hgotsAdmin = angular.module('HGOTSAdmin', [ 'HGOTSServices' ]);

hgotsAdmin.service('AdminShared', function() {
  return {
    userTypes: [ 'User', 'Controller', 'Admin' ],
    selectedUser: {}
  };
});
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
  
  $scope.showUser = function(user) {
    // redirect to page linked to in link, but on element click already
    $location.path('/admin/user/' + user.id);
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
    if ( $window.innerWidth >= 992 ) {
      var navbarHeight = $(".navbar").height();
      var scrollY = $window.scrollY;
      var offset = ( scrollY > navbarHeight ) ? ( scrollY - navbarHeight ) : 0;
      
      $scope.infoPanelStyle = { "margin-top": offset + "px" };
      $scope.$apply();
    }
  });
}]);

hgotsAdmin.controller('AdminUserController', [ '$scope', '$routeParams', 'AdminShared', 'User', function($scope, $routeParams, AdminShared, User) {
  $scope.userTypes = AdminShared.userTypes;
  $scope.$watch(function() {
    return AdminShared.selectedUser;
  }, function() {
    $scope.user = AdminShared.selectedUser;
  });
  $scope.$watch('user', 'checkIfDirty()');
  
  $scope.canSaveChanges = false;
  $scope.checkIfDirty = function() {
    var user = $scope.user;
    
    if ( !user ) {
      return false;
    }
    
    var usernameChanged = ( !!$scope.newUsername && user.username !== $scope.newUsername );
    var typeChanged = ( !!$scope.newType && user.type !== $scope.newType );
    var passwordChanged = ( !!$scope.newPassword && $scope.newPassword === $scope.newPasswordRepeat );
    
    var dirty = ( usernameChanged || typeChanged || passwordChanged );
    //console.log("dirty:", usernameChanged, typeChanged, passwordChanged, "=>", dirty);
    $scope.canSaveChanges = dirty;
  };
  
  $scope.newUsername = "";
  $scope.newType = $scope.userTypes[0];
  $scope.newPassword = "";
  $scope.newPasswordRepeat = "";
  
  ['newUsername', 'newType', 'newPassword', 'newPasswordRepeat'].forEach(function(scopeVariable) {
    $scope.$watch(scopeVariable, function() {
      $scope.checkIfDirty();
    });
  });
  
  $scope.saveUser = function() {
    $scope.user.username = $scope.newUsername;
    $scope.user.type = $scope.newType;
    if ( $scope.newPassword ) {
      $scope.user.password = $scope.newPassword;
    }
    
    $scope.user.$update(function(newUser, putResponseHeader) {
      $scope.user = newUser;
      
      $scope.newUsername = newUser.username;
      $scope.newType = newUser.type;
      $scope.newPassword = "";
      $scope.newPasswordRepeat = "";
    });
  };
}]);

hgotsAdmin.controller('AdminNewController', [ '$scope', 'AdminShared', function($scope, AdminShared) {
  $scope.userTypes = AdminShared.userTypes;
}]);
