hgots.controller('NavbarController', [ '$scope', '$http', 'AppShared', '$window', '$location', function($scope, $http, AppShared, $window, $location) {
  // Navbar itself
  $scope.currentUserIsPrivileged = false;
  $scope.$watch(function() { return AppShared.currentUser; }, function(user) {
    $scope.currentUserIsPrivileged = ( !!user && !!user.type && user.type !== "User" );
  });
  
  $scope.isActive = function(route) {
    var path = $location.path();
    
    return ( route === path || ( route.length > 1 && path.indexOf(route) !== -1 ) );
  };
  
  // Loading bar, related to navbar
  $(function() {
    // onload
    var className = 'scrolled';
    var body = $(document.body);
    var navbarHeight = $(".navbar").height();
    
    $(window).on('scroll', function() {
      var scrollY = $window.scrollY;
      
      if ( scrollY > 0 && !body.hasClass(className) ) {
        body.addClass(className);
      } else if ( scrollY === 0 && body.hasClass(className) ) {
        body.removeClass(className);
      }
      
      if ( !body.hasClass(className) || scrollY >= navbarHeight ) {
        $("#loading-bar .bar").css('top', '');
      } else {
        if ( scrollY < navbarHeight ) {
          // keep the indicator at the level until navbar is away
          $("#loading-bar .bar").css('top', ( navbarHeight - scrollY ) + "px");
        } 
      }
    });
  });
}]);
