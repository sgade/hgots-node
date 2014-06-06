hgots.controller('AboutController', [ '$scope', '$http', function($scope, $http) {
  $scope.pkg = { name: '...', version: '0.0.0' };
  
  $http.get('/info').success(function(pkg) {
    $scope.pkg = pkg;
  }).error(function(err) {
    console.log("Error retrieving pkg info:", err);
  });
}]);
