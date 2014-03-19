var helpers = require('./helpers');
var db = helpers.db;

/* /users */
exports.getAllUsers = function(req, res) {
  helpers.getRequestingUser(req, function(err, user) {
    
    if ( err ) {
      res.status(500).end();
      console.log("getAllUsers:", err);
    } else {
      
      if ( !user ) {
        res.status(403).end();
      } else {
        
        // TODO filter for type
        helpers.getAllUsers(function(err, users) {
          if ( err ) {
            res.status(500).end();
          } else {
            
            res.set('Content-Type', 'application/json');
            res.end(JSON.stringify(users));
            
          }
        });
        
      }
      
    }
    
  });
};

/* /user/:id/cards */
exports.getCardsOfUser = function(req, res) {
  helpers.getRequestingUser(req, function(err, user) {
    
    if ( err ) {
      res.status(500).end();
    } else {
      
      if ( !user ) {
        res.status(403).end();
      } else {
        
        // TODO filter for type
        var id = req.params.id;
        helpers.getUser({
          id: id
        }, function(err, user) {
          
          if ( user ) {
            user.getCards().success(function(cards) {
              
              if ( cards ) {
                res.set('Content-Type', 'application/json');
                res.end(JSON.stringify(cards));
              } else {
                res.status(500).end();
              }
              
            });
          }
          
        });
        
      }
      
    }
    
  });
};
