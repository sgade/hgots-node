// v1
/*describe('v1', function() {
  var prefix = apiPrefix + '/v1';
  
  describe('GET /users', function() {
    var url = prefix + '/users';
    
    it('should return all users to an admin', function(done) {
      authenticatedAdminAgent
        .get(url)
        .expect('Content-Type', /json/)
        .expect(200)
        .expect({users: users, cards: cards}, done);
    });
    
    it('should return only users to a controller', function(done) {
      authenticatedControllerAgent
        .get(url)
        .expect('Content-Type', /json/)
        .expect(200)
        .expect({users: users.filter(function(user) {
          return ( user.type == 'User' );
        }), cards: cards.filter(function(card) {
          var user = users[card.UserId - 1];
          return ( user.type === "User" );
        })}, done);
    });
    
    it('should return "403: Forbidden" to a user', function(done) {
      authenticatedUserAgent
        .get(url)
        .expect(403, done);
    });
  });
  
  describe('POST /users', function() {
    var url = prefix + '/users';
    
    it('should allow an admin to create a new user', function(done) {
      authenticatedAdminAgent
        .post(url)
        .send({user: { username: "newTestUser1", password: defaultPasswordHash, type: "User" } })
        .expect('Content-Type', /json/)
        .expect(200, done);
    });
    
    it('should allow an admin to create a new controller', function(done) {
      authenticatedAdminAgent
        .post(url)
        .send({user: { username: "newTestController1", password: defaultPasswordHash, type: "Controller" } })
        .expect('Content-Type', /json/)
        .expect(200, done);
    });
    
    it('should allow an admin to create a new admin', function(done) {
      authenticatedAdminAgent
        .post(url)
        .send({user: { username: "newTestAdmin1", password: defaultPasswordHash, type: "Admin" } })
        .expect('Content-Type', /json/)
        .expect(200, done);
    });
    
    it('should allow a controller to create a new user', function(done) {
      authenticatedControllerAgent
        .post(url)
        .send({user: { username: "newTestUser2", password: defaultPasswordHash, type: "User" } })
        .expect('Content-Type', /json/)
        .expect(200, done);
    });
    
    it('should not allow a controller to create a new controller', function(done) {
      authenticatedControllerAgent
        .post(url)
        .send({user: { username: "newTestController2", password: defaultPasswordHash, type: "Controller" } })
        .expect('Content-Type', /json/)
        .expect(403, done);
    });
    
    it('should not allow a controller to create a new admin', function(done) {
      authenticatedControllerAgent
        .post(url)
        .send({user: { username: "newTestAdmin2", password: defaultPasswordHash, type: "Admin" } })
        .expect('Content-Type', /json/)
        .expect(403, done);
    });
    
    it('should not allow a normal user to create a new user', function(done) {
      authenticatedUserAgent
        .post(url)
        .send({user: { username: "newTestUser3", password: defaultPasswordHash, type: "User" } })
        .expect('Content-Type', /json/)
        .expect(403, done);
    });
    
    it('should not allow a normal user to create a new controller', function(done) {
      authenticatedUserAgent
        .post(url)
        .send({user: { username: "newTestController3", password: defaultPasswordHash, type: "Controller" } })
        .expect('Content-Type', /json/)
        .expect(403, done);
    });
    
    it('should not allow a normal user to create a new admin', function(done) {
      authenticatedUserAgent
        .post(url)
        .send({user: { username: "newTestAdmin3", password: defaultPasswordHash, type: "Admin" } })
        .expect('Content-Type', /json/)
        .expect(403, done);
    });
  });
  
  describe('GET /users/:id', function() {
    var url = prefix + "/users/";
    
    it('should return user 3 to an admin', function(done) {
      authenticatedAdminAgent
        .get(url + 3)
        .expect('Content-Type', /json/)
        .expect(200)
        .expect({user: users[2], cards: cards.filter(function(card) {
          return ( card.UserId === users[2].id );
        }) }, done);
    });
    
    it('should return user 3 to a controller', function(done) {
      authenticatedControllerAgent
        .get(url + 3)
        .expect('Content-Type', /json/)
        .expect(200)
        .expect({ user: users[2], cards: cards.filter(function(card) {
          return ( card.UserId === users[2].id );
        }) }, done);
    });
    
    it('should return user 3 to user 3', function(done) {
      authenticatedUserAgent
        .get(url + 3)
        .expect('Content-Type', /json/)
        .expect(200)
        .expect({ user: users[2], cards: cards.filter(function(card) {
          return ( card.UserId === users[2].id );
        })  }, done);
    });
    
    it('should not return any user to any other user', function(done) {
      authenticatedUserAgent
        .get(url + 2)
        .expect(403, done);
    });
  });
  
  describe('PUT /users/:id', function() {
    var url = prefix + "/users/";
    var hisCards = cards.filter(function(card) {
      return ( card.UserId === 4 );
    });
    
    it('should allow an admin to update user 4', function(done) {
      authenticatedAdminAgent
        .put(url + 4)
        .send({ user: { username: "killMeToo", type: 'User' } })
        .expect('Content-Type', /json/)
        .expect(200)
        .expect({ user: {id: 4, username: "killMeToo", type: "User", cards: hisCards.map(function(card) {
          return card.id;
        })}, cards: hisCards }, done);
    });
    
    it('should allow a controller to update user 4', function(done) {
      authenticatedControllerAgent
        .put(url + 4)
        .send({user :{username: "killMeToo", type: 'User'} })
        .expect('Content-Type', /json/)
        .expect(200)
        .expect({ user: {id: 4, username: "killMeToo", type: "User", cards: hisCards.map(function(card) {
          return card.id;
        })}, cards: hisCards }, done);
    });
    
    it('should not allow user 4 to update user 4', function(done) {
      authenticatedDeadUserAgent
        .put(url + 4)
        .send({user: {username: "killMeToo"}})
        .expect('Content-Type', /json/)
        .expect(403, done);
    });
    
    it('should not allow user 4 to update user 3', function(done) {
      authenticatedDeadUserAgent
        .put(url + 4)
        .send({user: {username: "killMeToo"}})
        .expect('Content-Type', /json/)
        .expect(403, done);
    });
    
    it('should not allow a controller to update an admin', function(done) {
      authenticatedControllerAgent
        .put(url + 1)
        .send({user: { username: 'yeah!' }})
        .expect('Content-Type', /json/)
        .expect(403, done);
    });
  });
  
  describe('DELETE /users/:id', function() {
    var url = prefix + "/users/";
    
    it('should not allow user 4 to delete itself', function(done) {
      authenticatedDeadUserAgent
        .del(url + 4)
        .expect(403, done);
    });
    
    it('should not allow user 3 to delete user 4', function(done) {
      authenticatedUserAgent
        .del(url + 4)
        .expect(403, done);
    });
    
    it('should allow an admin to delete user 4', function(done) {
      authenticatedAdminAgent
        .del(url + 4)
        .expect(200, done);
    });
    
    it('should allow a controller to delete user 4', function(done) {
      authenticatedControllerAgent
        .del(url + 4)
        .expect(200, done);
    });
  });
  
  describe('GET /users/:id/cards', function() {
    var url = prefix + "/users";
    it('should return all cards of user 3 to an admin', function(done) {
      authenticatedAdminAgent
        .get(url + "/3/cards")
        .expect('Content-Type', /json/)
        .expect(200)
        .end(function(err, res) {
          res.body.should.be.an.Array.and.an.Object.and.have.lengthOf(cards.filter(function(card) {
            var user = users[card.UserId - 1];
            return ( user.id == 3 );
          }).length);

          var card = res.body[0];
          card.should.have.properties('id', 'uid', 'UserId');
          done();
        });
    });
    
    it('should return all cards of user 3 to user 3', function(done) {
      authenticatedUserAgent
        .get(url + "/3/cards")
        .expect('Content-Type', /json/)
        .expect(200)
        .end(function(err, res) {
          res.body.should.be.an.Array.and.an.Object.and.have.lengthOf(cards.filter(function(card) {
            var user = users[card.UserId - 1];
            return ( user.id == 3 );
          }).length);

          var card = res.body[0];
          card.should.have.properties('id', 'uid', 'UserId');
          done();
        });
    });
    
    it('should return no cards of user 1 to user 3', function(done) {
      authenticatedUserAgent
        .get(url + "/1/cards")
        .expect(403, done);
    });
  });
  
  describe('POST /cards', function() {
    var url = prefix + "/cards";
    var payload = { card: {
      uid: "42",
      user: 3
    } };
    it('should allow an Admin to add a new card to a user', function(done) {
      authenticatedAdminAgent
        .post(url)
        .send(payload)
        .expect(200, done);
    });
    
    it('should allow a controller to add a new card to a user', function(done) {
      authenticatedControllerAgent
        .post(url)
        .send(payload)
        .expect(200, done);
    });
    
    it('should not allow a normal user to add a new card to a user', function(done) {
      authenticatedUserAgent
        .post(url)
        .send(payload)
        .expect(403, done);
    });
  });
  
  describe('DELETE /cards/:id', function() {
    var url = prefix + "/cards/";
    
    it('should allow an Admin to delete a card from a user', function(done) {
      authenticatedAdminAgent
        .del(url + '3')
        .expect(200, done);
    });
    
    it('should allow a controller to delete a card from a user', function(done) {
      authenticatedControllerAgent
        .del(url + '4')
        .expect(200, done);
    });
    
    it('should not allow a normal user to delete a card from a user', function(done) {
      authenticatedUserAgent
        .del(url + '5')
        .expect(403, done);
    });
  });
});*/
