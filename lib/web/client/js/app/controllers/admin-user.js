hgotsAdmin.controller('AdminUserController', [ '$scope', '$stateParams', '$http', '$location', 'AdminShared', 'User', 'Card', 'confirm', '$translate', 'alert', function($scope, $stateParams, $http, $location, AdminShared, User, Card, confirm, $translate, alert) {
  if ( !AdminShared.selectedUser ) {
    AdminShared.selectedUser = User.get({ id: $stateParams.userId }, function(user) {
      AdminShared.selectedUser = user;
      console.log("User set");
    });
  }
  
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
  
  $scope.userIsSelf = function() {
    return ( AdminShared.currentUser.id === AdminShared.selectedUser.id );
  };
  
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
    if ( dirty && $scope.newPassword && !passwordChanged ) {
      dirty = false;
    }
    
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
      $scope.checkIfDirty();
    });
  };
  
  $scope.deleteUser = function() {
    $translate('ADMIN.USER.CONFIRM_DELETE_USER', {
      username: $scope.user.username
    }).then(function(confirmText) {
      
      confirm(confirmText).then(function(confirm) {
        if ( confirm ) {
          $scope.user.$delete(function() {
            AdminShared.showUser(null);
          });
        }
      });
      
    });
  };
  
  // Cards
  $scope.getRFID = function() {
    $scope.currentlyLoadingRFIDResponse = true;
    
    $http({ method: 'GET', url: '/api/v2/getrfid' }).success(function(data) {
      $scope.newCardID = data.rfid;
      
      $scope.currentlyLoadingRFIDResponse = false;
    }).error(function(data) {
      console.log("Error getting rfid:", data);
      var error = data.error;
      
      $translate('ADMIN.USER.ERROR_GETRFID', { error: error }).then(function(errorText) {
        alert(errorText).then(function() {
          $scope.currentlyLoadingRFIDResponse = false;
        });
      });
    });
  };
  
  $scope.$watch('newCardID', function() {
    $scope.newCardDisabled = ( !$scope.newCardID );
  });
  $scope.addCard = function() {
    var card = new Card({
      user_id: $scope.user.id,
      uid: $scope.newCardID
    });
    card.$save(function() {
      $scope.newCardID = "";
      
      $scope.user.cards.push(card.card);
    });
  };
  $scope.deleteCard = function(card) {
    $translate('ADMIN.USER.CONFIRM_DELETE_CARD', {
      uid: card.uid
    }).then(function(confirmText) {
      
      confirm(confirmText).then(function(confirm) {
        if ( confirm ) {
          $http({ method: 'DELETE', url: '/api/v2/users/' + $scope.user.id + '/cards/' + card.id }).success(function() {
            $scope.user.cards = $scope.user.cards.filter(function(cardItem) {
              return ( cardItem.id !== card.id );
            });
          });
        }
      });
      
    });
  };
}]);
