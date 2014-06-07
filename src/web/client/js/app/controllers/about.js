hgots.controller('AboutController', [ '$scope', 'AppShared', function($scope, AppShared) {
  $scope.$watch(function() {
    return AppShared.pkg;
  }, function() {
    $scope.pkg = AppShared.pkg;
    
    $scope.versionLinkToGithub = getLinkToGithubVersionFromPkg();
  });
  
  function getLinkToGithubVersionFromPkg() {
    var pkg = $scope.pkg;
    // get url
    var url = pkg.repository.url;
    url = url.substring(0, url.indexOf('.git'));
    return ( url + '/releases/v' + pkg.version );
  }
}]);
