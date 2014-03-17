var helpers = require('./helpers');
var db = helpers.db;

module.exports.getAllUsers = function(req, res) {
  helpers.getRequestingUser(req, function(err, user) {
    
    if ( err ) {
      res.status(500).end();
      console.log("getAllUsers:", err);
    } else {
      
      if ( !user ) {
        res.status(403).end();
      } else {
        
        // TODO filter for type
        helpers.getUser({}, function(err, users) {
          if ( err ) {
            res.status(500).end();
          } else {
            
            res.end(JSON.stringify(users));
            
          }
        });
        
      }
      
    }
    
  });
};
