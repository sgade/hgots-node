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
  
  $scope.$watch('dateModel', function() {
    $scope.date = new Date($scope.dateModel);
    $scope.loadLog();
  });
  // starting date is always today
  $scope.dateModel = dateForInput(new Date());
  
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
      
      var startRegex = /v[0-9]*\.[0-9]*\.[0-9]*\ started/;
      
      line = line.replace(dateRegex, '<span class="time">$&</span>');
      line = line.replace(errorRegex, '<span class="error">$&</span>');
      
      if ( line.search(startRegex) !== -1 ) {
        line += '<span class="app-start" title="The app was started at this point."><span class="octicon octicon-chevron-left"></span></span>';
      }
      
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
      
      if ( $scope.date !== date ) {
        console.log("Date changed.");
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
  // helper for ng-bind-html
  $scope.trustAsHtml = function(html) {
    return $sce.trustAsHtml(html);
  };
}]);
