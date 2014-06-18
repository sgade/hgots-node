var passwordStrength = angular.module('PasswordStrengthView', []);

if ( !window.setImmediate ) {
  window.setImmediate = function(fn) {
    window.setTimeout(fn, 0);
  };
}

// "async" wrapper for zxcvbn
passwordStrength.factory('zxcvbn', [ '$q', function($q) {
  return function(password, user_inputs) {
    var defer = $q.defer();
    
    setImmediate(function() {
      password = password || "";
      
      defer.notify('start');
      var estimate = zxcvbn(password, user_inputs);
      defer.notify('done');
      
      defer.resolve(estimate);
    }, 0);
    
    return ( defer.promise );
  };
}]);

passwordStrength.controller('PasswordStrengthViewController', [ '$scope', 'zxcvbn', function($scope, zxcvbn) {
  var estimations = {
    0: "very bad",
    1: "bad",
    2: "still bad",
    3: "okay",
    4: "good"
  };
  function setEstimate(estimate) {
    $scope.estimate = estimate;
    
    $scope.barClass = "score-" + estimate.score;
    $scope.estimation = estimations[estimate.score];
  }
  
  $scope.$watch('password', function() {
    zxcvbn($scope.password).then(function(estimate) {
      setEstimate(estimate);
    });
  });
  
  
}]);
