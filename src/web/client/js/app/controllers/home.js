hgots.controller('HomeController', [ '$scope', '$http', '$timeout', 'alert', 'confirm', function($scope, $http, $timeout, alert) {
  $scope.buttonDisabled = false;
  
  $scope.openDoor = function() {
    $scope.buttonDisabled = true;
    
    $http.get('/api/v2/opendoor').success(function() {
      // reset button state after 10s to prevent spamming
      $timeout(function() {
        $scope.buttonDisabled = false;
      }, 10000);
    }).error(function(err) {
      err = err.error || err;
      console.log("Error opening door:", err);
      
      // show alert to user
      alert('Could not open the door: ' + err + '\nWe\'re sorry.').then(function() {
        // reset button state
        $scope.buttonDisabled = false;
      });
    });
  };
}]);
