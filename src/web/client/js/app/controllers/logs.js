hgots.controller('LogsController', [ '$scope', '$http', function($scope, $http) {
  
  var date = new Date();
  $scope.date = date;
  var year = date.getFullYear();
  var month = date.getMonth() + 1;
  var day = date.getDate();
  var url = '/api/v2/log/' + year + '/' + month + '/' + day;
  
  $http({ url: url, method: 'GET' }).success(function(logObject) {
    logObject = logObject.log;
    
    var find = new RegExp('\n', 'g');
    var content = logObject.content;
    lines = content.split('\n');
    lines = lines.filter(function(line) {
      return line.length > 0;
    });
    
    $scope.logLines = lines;
  }).error(function(err) {
    alert("Could not load log.");
  });
}]);
