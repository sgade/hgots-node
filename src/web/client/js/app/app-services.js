var hgotsServices = angular.module('HGOTSServices', [ 'ngResource' ]);

hgotsServices.service('HGOTSServicesShared', function() {
  return {
    apiPrefix: '/api/v2'
  };
});
hgotsServices.factory('User', [ '$resource', 'HGOTSServicesShared', function($resource, HGOTSServicesShared) {
  var apiPrefix = HGOTSServicesShared.apiPrefix;
  
  return $resource(apiPrefix + '/users/:userId', { userId: '@id' }, {
    query: {
      method: 'GET',
      transformResponse: function(data) {
        var json = angular.fromJson(data);
        return json.users;
      },
      isArray: true
    },
    get: {
      method: 'GET',
      transformResponse: function(data) {
        var json = angular.fromJson(data);
        return json.user;
      }
    },
    save: {
      method: 'POST',
      transformRequest: function(resource) {
        var retVal = {
          user: {
            username: resource.username,
            type: resource.type,
            password: resource.password
          }
        };
        
        return angular.toJson(retVal);
      },
      transformResponse: function(data) {
        var json = angular.fromJson(data);
        return json.user;
      }
    },
    update: {
      method: 'PUT',
      transformRequest: function(resource) {
        var retVal = { user: {
          id: resource.id,
          username: resource.username,
          type: resource.type
        } };
        if ( resource.password ) {
          retVal.user.password = resource.password;
        }
        
        return angular.toJson(retVal);
      },
      transformResponse: function(data) {
        var json = angular.fromJson(data);
        return json.user;
      }
    }
  });
}]);

hgotsServices.factory('Card', [ '$resource', 'HGOTSServicesShared', function($resource, HGOTSServicesShared) {
  var apiPrefix = HGOTSServicesShared.apiPrefix;
  
  return $resource(apiPrefix + '/users/:userId/cards/:cardId', { userId: '@user_id', cardId: '@id' }, {
    save: {
      method: 'POST',
      transformRequest: function(resource) {
        var retVal = {
          card: {
            user_id: resource.user_id,
            uid: resource.uid
          }
        };
        
        return angular.toJson(retVal);
      }
    }
  });
}]);

// Modals, implemented as async factories. Inspired by http://www.bennadel.com/blog/2632-creating-asynchronous-alerts-prompts-and-confirms-in-angularjs.htm
window.setImmediate = function(fn) {
  window.setTimeout(fn, 0);
};

hgotsServices.factory('alert', [ '$window', '$q', function($window, $q) {
  return function(message) {
    var defer = $q.defer();
    
    $window.setImmediate(function() {
      $window.alert(message);
    
      defer.resolve();
    });
    
    return ( defer.promise );
  };
}]);
