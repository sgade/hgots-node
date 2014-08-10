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

hgots.controller('LanguageSwitcherController', [ '$scope', '$translate', function($scope, $translate) {
  $scope.languages = [ {
    key: 'en',
    name: 'English'
  }, {
    key: 'de',
    name: 'Deutsch'
  } ];
  
  $scope.selectedLanguage = $scope.languages[$translate.preferredLanguage()];
  $scope.$watch('selectedLanguage', function() {
    if ( $scope.selectedLanguage ) {
      $translate.use($scope.selectedLanguage.key);
    }
  });
}]);
