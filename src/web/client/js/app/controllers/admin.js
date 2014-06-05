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
  $scope.ifCurrentUserStyle = function(user) {
    if ( !!AdminShared.selectedUser ) {
      if ( AdminShared.selectedUser === user ) {
        
        return "current-user";
        
      }
    }
    
    return "";
  };
  
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
  // set all user types
  $scope.userTypes = AdminShared.userTypes;
  // watch for user changes
  function setNewValuesByUser(user) {
    $scope.newUsername = user.username;
    $scope.newType = user.type;
    $scope.newPassword = "";
    $scope.newPasswordRepeat = "";
  }
  $scope.$watch(function() {
    return AdminShared.selectedUser;
  }, function() {
    $scope.user = AdminShared.selectedUser;
    setNewValuesByUser($scope.user);
  });
  $scope.$watch('user', 'checkIfDirty()');
  
  // make save available
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
  // also check on every 'new' variable
  ['newUsername', 'newType', 'newPassword', 'newPasswordRepeat'].forEach(function(scopeVariable) {
    $scope.$watch(scopeVariable, function() {
      $scope.checkIfDirty();
    });
  });
  
  // save changes to server
  $scope.saveUser = function() {
    $scope.user.username = $scope.newUsername;
    $scope.user.type = $scope.newType;
    if ( $scope.newPassword ) {
      $scope.user.password = $scope.newPassword;
    }
    
    $scope.user.$update(function(newUser, putResponseHeader) {
      $scope.user = newUser;
      setNewValuesByUser(newUser);
    });
  };
}]);

hgotsAdmin.controller('AdminNewController', [ '$scope', 'AdminShared', function($scope, AdminShared) {
  $scope.userTypes = AdminShared.userTypes;
}]);
