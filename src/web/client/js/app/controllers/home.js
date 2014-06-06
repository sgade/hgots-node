hgots.controller('HomeController', [ '$scope', '$http', '$timeout', function($scope, $http, $timeout) {
  $scope.buttonDisabled = false;
  
  $scope.openDoor = function() {
    $scope.buttonDisabled = true;
    
    $http.get('/api/v2/opendoor').success(function() {
      // reset button state after 10s to prevent spamming
      $timeout(function() {
        $scope.buttonDisabled = false;
      }, 10000);
    }).error(function(err) {
      console.log("Error opening door:", err);
      // reset button state
      $scope.buttonDisabled = false;
    });
  };
}]);
