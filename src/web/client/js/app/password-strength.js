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

/*
 * How to use in your HTML Angular Template:
 * 1. Add root element with class 'password-strength-view'
 * 2. Add an input field with 'ng-model="password"'
 * 3. You may want to bind ng-change to update a variable in your controller's scope (e.g. $parent.newPassword=password)
 * 4. You may style everything the way you like.
 * 5. The controller provides a text estimation under 'estimation', the entire zxcvbn analysis under 'estimate' and the bar class under 'barClass'. If you want provide color for text, use 'textClass'.
 *
 * Example:
 * <div class="password-strength-view" ng-controller="PasswordStrengthViewController">
 *    <div class="input-group">
 *      <input type="password" id="newuser-password" class="form-control" placeholder="Password" ng-model="password" ng-change="$parent.newPassword=password" required>
 *      <span class="input-group-addon" ng-cloak>{{estimation}}</span>
 *    </div>
 *    <div class="bar {{barClass}}"></div>
 * </div>
 *
 * */

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
    $scope.textClass = $scope.barClass;
    $scope.estimationScore = estimate.score;
    $scope.estimation = estimations[estimate.score];
  }
  
  $scope.$watch('password', function() {
    zxcvbn($scope.password).then(function(estimate) {
      setEstimate(estimate);
    });
  });
  
}]);
