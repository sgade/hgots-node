var hgotsServices = angular.module('HGOTSServices', [ 'ngResource' ]);

hgotsServices.factory('User', [ '$resource', function($resource) {
  var apiPrefix = '/api/v2';
  
  return $resource(apiPrefix + '/users/:userId', { userId: '@id' }, {
    query: {
      method: 'GET',
      transformResponse: function(data) {
        var json = JSON.parse(data);
        return json.users;
      },
      isArray: true
    },
    get: {
      method: 'GET',
      transformResponse: function(data) {
        var json = JSON.parse(data);
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
                      
        console.log("transformRequest:", resource, "to", retVal);
        
        return JSON.stringify(retVal);
      },
      transformResponse: function(data) {
        var json = JSON.parse(data);
        return json.user;
      }
    }
  });
}]);
