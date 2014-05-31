var hgotsAdmin = angular.module('HGOTSAdmin', [ 'HGOTSServices' ]);

hgotsAdmin.controller('AdminController', [ '$scope', 'User', function($scope, User) {
  $scope.users = User.all();
}]);
