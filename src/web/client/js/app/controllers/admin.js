var hgotsAdmin = angular.module('HGOTSAdmin', [ 'HGOTSServices' ]);

hgotsAdmin.controller('AdminController', [ '$scope', '$routeParams', 'User', function($scope, $routeParams, User) {
  $scope.users = User.query();
  $scope.includeFile = "views/admin-welcome.html";
  
  $scope.showUserDetails = !!$routeParams.userId;
  if ( $scope.showUserDetails ) {
    $scope.includeFile = "views/admin-user.html";
  }
}]);

hgotsAdmin.controller('AdminUserController', [ '$scope', '$routeParams', 'User', function($scope, $routeParams, User) {
  $scope.userDetails = User.get({
    userId: $routeParams.userId
  });
}]);
