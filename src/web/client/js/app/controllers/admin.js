var hgotsAdmin = angular.module('HGOTSAdmin', [ 'HGOTSApp', 'HGOTSServices', 'ui.bootstrap' ]);

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

hgotsAdmin.controller('AdminUserController', [ '$scope', '$routeParams', '$http', '$location', 'AdminShared', 'User', 'Card', 'confirm', function($scope, $routeParams, $http, $location, AdminShared, User, Card, confirm) {
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
    confirm('Do you really want to delete ' + $scope.user.username + '?').then(function(confirm) {
      if ( confirm ) {
        $scope.user.$delete(function() {
          AdminShared.showUser(null);
        });
      }
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
      
      $scope.currentlyLoadingRFIDResponse = false;
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
    confirm("Do you really want to remove card '" + card.uid + "' from this user?").then(function(confirm) {
      if ( confirm ) {
        $http({ method: 'DELETE', url: '/api/v2/users/' + $scope.user.id + '/cards/' + card.id }).success(function() {
          $scope.user.cards = $scope.user.cards.filter(function(cardItem) {
            return ( cardItem.id !== card.id );
          });
        });
      }
    });
  };
}]);

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
