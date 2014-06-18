hgots.controller('LogsController', [ '$scope', '$http', 'HGOTSServicesShared', '$sce', function($scope, $http, HGOTSServicesShared, $sce) {
  var apiPrefix = HGOTSServicesShared.apiPrefix;
  
  function zerofy(num) {
    if ( num < 10 ) {
      return "0" + num;
    } else {
      return num;
    }
  }
  function dateForInput(date) {
    return date.getFullYear() + "-" + zerofy( date.getMonth() + 1 ) + "-" + zerofy( date.getDate() );
  }
  
  $scope.$watch('date', function() {
    $scope.dateModel = dateForInput($scope.date);
  });
  $scope.$watch('dateModel', function() {
    $scope.date = new Date($scope.dateModel);
    $scope.loadLog();
  });
  
  function parseRawContent(content) {
    content = content.split('\n');
    return content.filter(function(line) {
      return ( line.length > 0 );
    });
  }
  function parseContentLines(lines) {  
    lines = lines.map(function(line) {
      var dateRegex = /[0-9]+:[0-9]+:[0-9]+/;
      var dateSurplusRegex = /:\ /;
      var errorRegex = /\[Error: .*]/g;
      
      line = line.replace(dateRegex, '<span class="time">$&</span>');
      line = line.replace(errorRegex, '<span class="error">$&</span>');
      
      return line;
    });
    
    return lines;
  }
  
  $scope.loadLog = function() {
    var date = $scope.date;
    
    var year = date.getFullYear();
    var month = date.getMonth() + 1;
    var day = date.getDate();
    
    var url = apiPrefix + '/log/' + year + '/' + month + '/' + day;
    
    $http({ url: url, method: 'GET' }).success(function(response) {
      if ( !response.log ) {
        //console.log("No log file found.");
        $scope.logLines = null;
        return;
      }
      
      var log = response.log;
      var content = parseRawContent(log.content);
      var lines = parseContentLines(content);
      /* $scope.trustedLogLines = [];
      angular.forEach(lines, function(line) {
        $scope.trustedLogLines.push(
          $sce.trustAsHtml(line)
        );
      }); */
      $scope.logLines = lines;
    }).error(function(err) {
      console.error("Error loading log file:", err);
    });
  };
  $scope.trustAsHtml = function(html) {
    return $sce.trustAsHtml(html);
  };
  
  $scope.date = new Date();
}]);
