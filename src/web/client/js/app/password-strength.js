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

