var helpers = require('./helpers');

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
                userList.push(user.getPublicModel());
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
        var user = req.body.user;
        var username, password, type;
        if ( user ) {
          username = user.username;
          password = user.password;
          type = user.type;
        }
                
        if ( !user || !username || !password || !type ) {
          res.status(400).end();
          return;
        }
        
        if ( reqUser.isAdmin() || ( reqUser.isController() && type == 'User' ) ) {
          
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
          
          helpers.getUser({
            id: id
          }, function(err, user) {
            if ( err ) {
              res.status(500).end();
            } else {
              
              if ( reqUser.isController() && user.isAdmin() ) {
                res.status(403).set('Content-Type', 'application/json').end(JSON.stringify({
                  message: 'Forbidden'
                }));
              } else {
                
                var updatedUser = req.body.user;
                if ( !updatedUser ) {
                  res.status(400).end();
                  return;
                }
                
                var username = updatedUser.username,
                  password = updatedUser.password,
                  type = updatedUser.type;
                
                // only save password if a new one was set
                updatedHash = {
                  username: username,
                  type: type
                };
                if ( password ) {
                  updatedHash.password = password;
                }
                
                helpers.updateUser(id, updatedHash, function(err, user) {
                  if ( err ) {
                    res.status(500).end();
                  } else {
                    helpers.sendPublicUser(res, user);
                  }
                });
                
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

/* DELETE /user/:id */
exports.deleteUser = function(req, res) {
  helpers.getRequestingUser(req, function(err, reqUser) {
    if ( err ) {
      res.status(500).end();
    } else {
      if ( !reqUser ) {
        res.status(403).end();
      } else {
        
        if ( reqUser.isPrivileged() ) {
          var id = req.params.id;
          
          helpers.getUser({
            id: id
          }, function(err, user) {
            if ( err ) {
              res.status(500).end();
            } else {
              
              if ( !user ) {
                res.status(400).end();
              }
              
              if ( !user.isPrivileged() || ( user.isPrivileged() && reqUser.isAdmin() ) ) {
                helpers.deleteUserObject(user, function(err) {
                  if ( err ) {
                    res.status(500).end();
                  } else {
                    res.status(200).end();
                  }
                });
              } else {
                res.status(403).set('Content-Type', 'application/json').end(JSON.stringify({
                  message: 'Forbidden'
                }));
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
