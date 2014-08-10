hgotsAdmin.controller('AdminNewController', [ '$scope', 'AdminShared', 'User', function($scope, AdminShared, User) {
  $scope.userTypes = AdminShared.userTypes;
  
  $scope.newUsername = "";
  $scope.newType = $scope.userTypes[0];
  $scope.newPassword = "";
  $scope.newPasswordRepeat = "";
  $scope.createDisabled = true;
  // make create available
  $scope.checkIfValid = function() {
    var usernamePresent = ( !!$scope.newUsername );
    var passwordPresent = ( !!$scope.newPassword && $scope.newPassword === $scope.newPasswordRepeat );
    
    var valid = ( usernamePresent && passwordPresent );
    $scope.createDisabled = !valid;
    return valid;
  };
  // also check on every 'new' variable
  ['newUsername', 'newType', 'newPassword', 'newPasswordRepeat'].forEach(function(scopeVariable) {
    $scope.$watch(scopeVariable, function() {
      $scope.checkIfValid();
    });
  });
  
  $scope.createUser = function() {
    var newUser = new User({
      username: $scope.newUsername,
      type: $scope.newType,
      password: $scope.newPassword
    });
    newUser.$save(function(user) {
      AdminShared.showUser(user);
    });
  };
}]);
