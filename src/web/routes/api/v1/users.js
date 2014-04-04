var helpers = require('./helpers');
var db = helpers.db;

/* GET /users */
exports.getAllUsers = function(req, res) {
  helpers.getRequestingUser(req, function(err, reqUser) {
    if ( err ) {
      res.status(500).end();
    } else {
      
      if ( !reqUser ) {
        res.status(403).end();
      } else {
        if(!reqUser.isPrivileged()) {
           res.status(403).end();
        } else {
          helpers.getAllUsers(function(err, users) {
            if ( err ) {
              res.status(500).end();
            } else {
              
              var userList = [];
              users.forEach(function(user) {
                userList.push(helpers.getPublicUser(user));
              });
              
              res.set('Content-Type', 'application/json');
              res.end(JSON.stringify({
                users: userList
              }));
            
            }
          });
        }
        
      }
      
    }
  });
};

/* POST /users */
exports.createNewUser = function(req, res) {
  helpers.getRequestingUser(req, function(err, reqUser) {
    if ( err ) {
      res.status(500).end();
    } else {
      
      if ( !reqUser ) {
        res.status(403).end();
      } else {
        var username = req.body.username,
          password = req.body.password,
          type = req.body.type;
                
        if ( !username || !password || !type ) {
          res.status(400).end();
          return;
        }
        
        if ( reqUser.isAdmin() || ( reqUser.isController() && type == 'user' ) ) {
          
          helpers.createUser({
            username: username,
            password: password,
            type: type
          }, function(err, user) {
            if ( err ) {
              res.status(500).end();
            } else {
              if ( !user ) {
                res.status(400).end();
              } else {
                helpers.sendPublicUser(res, user);
              }
            }
          });
          
        } else {
          res.status(403).set('Content-Type', 'application/json').end(JSON.stringify({
            message: 'Forbidden'
          }));
        }
      }
      
    }
  });
};

/* GET /user/:id */
exports.getUser = function(req, res) {
  helpers.getRequestingUser(req, function(err, reqUser) {
    if ( err ) {
      res.status(500).end();
    } else {
      
      if ( !reqUser ) {
        res.status(403).end();
      } else {
        var id = req.params.id;
        
        if ( id < 1 ) {
          res.status(400).end();
          return;
        }
        
        if ( reqUser.isPrivileged() || reqUser.id == id ) {
          helpers.getUser({
            id: id
          }, function(err, user) {
            if ( err ) {
              res.status(500).end();
            } else {
              if ( !user ) {
                res.status(404).end();
              } else {
                helpers.sendPublicUser(res, user);
              }
            }
          });
        } else {
          res.status(403).set('Content-Type', 'application/json').end(JSON.stringify({
            message: 'Forbidden'
          }));
        }
      }
      
    }
  });
};

/* GET /user/:id/cards */
exports.getCardsOfUser = function(req, res) {
  helpers.getRequestingUser(req, function(err, reqUser) {
    if ( err ) {
      res.status(500).end();
    } else {
      
      if ( !reqUser ) {
        res.status(403).end();
      } else {
        var id = req.params.id;

        if ( reqUser.isPrivileged() || user.id == id ) {
          helpers.getUser({
            id: id
          }, function(err, user) {
          
            if ( user ) {
              user.getCards().success(function(cards) {
              
                if ( cards ) {
                  res.set('Content-Type', 'application/json');
                  res.end(JSON.stringify(cards));
                } else {
                  res.end(500).end();
                }
              
              });
            }
          
          });
          
        } else {
          res.status(403).end();
        }
        
      }
      
    }
  });
};

/* PUT /user/:id */
exports.updateUser = function(req, res) {
  helpers.getRequestingUser(req, function(err, reqUser) {
    if ( err ) {
      res.status(500).end();
    } else {
      if ( !reqUser ) {
        res.status(403).end();
      } else {
        
        if ( reqUser.isPrivileged() ) {
          var id = req.params.id;
          if ( id < 1 ) {
            res.status(400).end();
            return;
          }
          var username = req.body.username,
            password = req.body.password,
            type = req.body.type;
          
          helpers.updateUser(id, {
            username: username,
            password: password,
            type: type
          }, function(err, user) {
            if ( err ) {
              res.status(500).end();
            } else {
              helpers.sendPublicUser(res, user);
            }
          });
        } else {
          res.status(403).set('Content-Type', 'application/json').end(JSON.stringify({
            message: 'Forbidden'
          }));
        }
        
      }
    }
  });
};
