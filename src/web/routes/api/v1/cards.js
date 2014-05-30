var helpers = require('./helpers');

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

        if ( reqUser.isPrivileged() || reqUser.id == id ) {
          helpers.getUser({
            id: id
          }, function(err, user) {
          
            if ( user ) {
              user.getCards().complete(function(err, cards) {
                if ( err ) {
                  res.status(500).end();
                } else {
                  cards = cards || [];
                  
                  var cardsList = [];
                  cards.forEach(function(card) {
                    cardsList.push(card.getPublicModel());
                  });
                  
                  res.set('Content-Type', 'application/json');
                  res.end(JSON.stringify(cardsList));
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

/* GET /card/:id */
exports.getCard = function(req, res) {
  helpers.getRequestingUser(req, function(err, reqUser) {
    if ( err ) {
      res.status(500).end();
    } else {
      
      if ( !reqUser ) {
        res.status(403).end();
      } else {
        var id = req.params.id;

        if ( reqUser.isPrivileged() ) {
          helpers.getCard({
            id: id
          }).complete(function(err, card) {
            if ( !!err ) {
              return res.status(500).end();
            }
            if ( !card ) {
              return res.status(400).end();
            }
            
            card.getUser().complete(function(err, user) {
              if ( !!err ) {
                return res.status(500).end();
              }
              if ( !user ) {
                return res.status(400).end();
              }
              
              var publicCard = card.getPublicModel();
              publicCard.user = user.id;
              
              res.set('Content-Type', 'application/json');
              res.end(JSON.stringify(publicCard));
            });
          });
          
        } else {
          res.status(403).end();
        }
        
      }
      
    }
  });
};

/* POST /cards */
exports.createNewCard = function(req, res) {
  helpers.getRequestingUser(req, function(err, reqUser) {
    if ( err ) {
      res.status(500).end();
    } else {
      if ( !reqUser ) {
        res.status(403).end();
      } else {
        
        if ( reqUser.isPrivileged() ) {
          var cardBody = req.body.card;
          if ( !cardBody ) {
            return res.status(400).end();
          }
          var id = cardBody.user;
          var uid = cardBody.uid;
          
          helpers.getUser({
            id: id
          }, function(err, user) {
            if ( err ) {
              res.status(500).end();
            } else {
              if ( !user ) {
                res.status(400).end();
              } else {
                
                helpers.createCard({
                  uid: uid
                }, function(err, card) {
                  if ( err ) {
                    res.status(500).end();
                  } else {
                    card.setUser(user);
                    
                    var publicCard = card.getPublicModel();
                    publicCard.user = user.id;
                    
                    res.set('Content-Type', 'application/json').end(JSON.stringify({
                      card: publicCard
                    }));
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

exports.deleteCard = function(req, res) {
  helpers.getRequestingUser(req, function(err, reqUser) {
    if ( err ) {
      res.status(500).end();
    } else {
      if ( !reqUser ) {
        res.status(403).end();
      } else {
        
        if ( reqUser.isPrivileged() ) {
          
          var cardId = req.params.id;
          
          helpers.getCard({
            id: cardId
          }, function(err, card) {
            if ( err ) {
              res.status(500).end();
            } else {
              
              card.destroy().complete(function(err) {
                if ( !!err ) {
                  res.status(500).end();
                } else {
                  res.status(200).end(JSON.stringify({}));
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
