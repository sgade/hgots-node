hgots.controller('LogsController', [ '$scope', '$http', function($scope, $http) {
  
  var date = new Date();
  var year = date.getFullYear();
  var month = date.getMonth() + 1;
  var day = date.getDate();
  var url = '/api/v2/log/' + year + '/' + month + '/' + day;
  
  $http({ url: url, method: 'GET' }).success(function(logObject) {
    logObject = logObject.log;
  
    logObject.content = logObject.content.replace('\n', "<br>");
  
    $scope.log = logObject;
  }).error(function(err) {
    alert("Could not load log.");
  });
}]);
