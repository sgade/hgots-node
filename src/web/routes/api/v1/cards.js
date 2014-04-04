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

/* POST /user/:id/card */
exports.createNewCard = function(req, res) {
  helpers.getRequestingUser(req, function(err, reqUser) {
    if ( err ) {
      res.status(500).end();
    } else {
      if ( !reqUser ) {
        res.status(403).end();
      } else {
        
        if ( reqUser.isPrivileged() ) {
          var id = req.params.id;
          var uid = req.body.uid;
          
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
                    user.addCard(card);
                    
                    res.set('Content-Type', 'application/json').end(JSON.stringify(card.getPublicModel()));
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
