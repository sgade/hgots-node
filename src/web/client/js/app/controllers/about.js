hgots.controller('AboutController', [ '$scope', '$http', function($scope, $http) {
  $scope.pkg = { name: '...', version: '0.0.0' };
  
  function getLinkToGithubVersionFromPkg(pkg) {
    // get url
    var url = pkg.repository.url;
    url = url.substring(0, url.indexOf('.git'));
    return ( url + '/releases/v' + pkg.version );
  }
  
  $http.get('/info').success(function(pkg) {
    $scope.pkg = pkg;
    
    $scope.versionLinkToGithub = getLinkToGithubVersionFromPkg(pkg);
  }).error(function(err) {
    console.log("Error retrieving pkg info:", err);
  });
}]);
