var hgotsAdmin = angular.module('HGOTSAdmin', [ 'HGOTSServices' ]);

hgotsAdmin.controller('AdminController', [ '$scope', '$routeParams', 'User', function($scope, $routeParams, User) {
  $scope.users = User.query();
  $scope.includeFile = "views/admin-welcome.html";
  
  $scope.showUserDetails = !!$routeParams.userId;
  if ( $scope.showUserDetails ) {
    $scope.includeFile = "views/admin-user.html";
  }
  $scope.rightPanelStyle = { "margin-top": "0px" };
  // little scroll "hack"
  $($window).on('scroll', function() {
    if ( $window.innerWidth >= 992 ) {
      var navbarHeight = $(".navbar").height();
      var scrollY = $window.scrollY;
      var offset = ( scrollY > navbarHeight ) ? ( scrollY - navbarHeight ) : 0;
      
      $scope.rightPanelStyle = { "margin-top": offset + "px" };
      $scope.$apply();
    }
  });
}]);

hgotsAdmin.controller('AdminUserController', [ '$scope', '$routeParams', 'User', function($scope, $routeParams, User) {
  $scope.userTypes = [ 'User', 'Controller', 'Admin' ];
  $scope.user = User.get({
    userId: $routeParams.userId
  }, function(user) {
    $scope.newUsername = user.username;
    $scope.newType = user.type;
  });
  
  $scope.canSaveChanges = false;
  $scope.checkIfDirty = function() {
    var user = $scope.user;
    
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
