var hgotsServices = angular.module('HGOTSServices', [ 'ngResource' ]);

hgotsServices.factory('User', [ '$resource', function($resource) {
  var apiPrefix = '/api/v1';
  
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
    }
  });
}]);
