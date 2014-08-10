hgots.controller('HomeController', [ '$scope', '$http', '$timeout', 'alert', '$translate', function($scope, $http, $timeout, alert, $translate) {
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
      console.error("Error opening door:", err);
      
      $translate('HOME.ERROR', { err: err }).then(function(errorString) {
        // show alert to user
        alert(errorString).then(function() {
          // reset button state
          $scope.buttonDisabled = false;
        });
        
      });
    });
  };
}]);
