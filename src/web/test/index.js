var async = require('async');
var should = require('should');
var request = require('supertest');
var sequelize_fixtures =  require('sequelize-fixtures');

var app = require('../');
var db = require('../../db');
var expressApp = null;
var port = 3333;

/* Fixtures */
var defaultPasswordHash = "fd5cb51bafd60f6fdbedde6e62c473da6f247db271633e15919bab78a02ee9eb";
var users = [ {
  id: 1,
  username: "testAdmin",
  type: "Admin",
  cards: [ 1, 2 ]
}, {
  id: 2,
  username: "testController",
  type: "Controller",
  cards: [ 3 ]
}, {
  id: 3,
  username: "testUser",
  type: "User",
  cards: [ 4 ]
}, {
  id: 4,
  username: "foo",
  type: "User",
  cards: []
} ];
var cards = [ {
  "UserId": 1,
  "id": 1,
  "uid": "0123456789"
}, {
  "UserId": 1,
  "id": 2,
  "uid": "1234567890"
}, {
  "UserId": 2,
  "id": 3,
  "uid": "2345678901"
}, {
  "UserId": 3,
  "id": 4,
  "uid": "3456789012"
} ];

/* Agents */
var authenticatedAdminAgent;
var authenticatedControllerAgent;
var authenticatedUserAgent;
var authenticatedDeadUserAgent;

var loginUser = function(username, cb) {
  var server = request.agent('http://localhost:' + port);
  server
    .post('/auth/login')
    .type('form')
    .send({ username: username })
    .send({ password: defaultPasswordHash })
    .end(function(err, res) {
      cb(err, server);
    });
};

// first, test the server...
describe('HGOTS Server Specs', function() {
  beforeEach(function(done) {
    app.init(port, null, null, function() {
      app.start(function() {
        expressApp = app.getExpress();
        sequelize_fixtures.loadFixtures(require('./fixtures/test.json'), db, function() {
          async.map(["testAdmin", "testController", "testUser", "foo"], loginUser, function(err, results) {
            if ( err ) throw err;

            authenticatedAdminAgent = results[0];
            authenticatedControllerAgent = results[1];
            authenticatedUserAgent = results[2];
            authenticatedDeadUserAgent = results[3];

            done();
          });
        });
      });
    });
  });
  
  afterEach(function(done) {
    app.stop();
    done();
  });
  
  describe('Web Server', function() {
    it('should exist', function(done) {
      should.exist(expressApp);
      done();
    });
    
    it('should be listening at localhost:' + port, function(done) {
      request(expressApp)
        .get('/')
        .expect(200, done);
    });
    
    describe('GET /', function() {
      it('should respond with HTML on /', function(done) {
        request(expressApp)
          .get('/')
          .expect('Content-Type', /html/)
          .expect(200, done);
      });
    });
    
    describe('POST /auth/login', function() {
      var loginUrl = '/auth/login';
      
      it('should redirect to / ', function(done) {
        request(expressApp)
          .post(loginUrl)
          .expect(302)
          .end(function(err, res) {
            if ( !!err ) {
              throw err;
            }
            
            res.header.location.should.include('/');
            done();
          });
      });
      
      it('should redirect to / without credentials', function(done) {
        request(expressApp)
          .post(loginUrl)
          .type('form')
          .expect(302)
          .end(function(err, res) {
            if ( !!err ) {
              throw err;
            }
            
            res.header.location.should.include('/');
            done();
          });
      });
      
      it('should redirect to / with wrong credentials', function(done) {
        request(expressApp)
          .post(loginUrl)
          .type('form')
          .send({ username: "wrongUsername", password: "wrongPassword" })
          .expect(302)
          .end(function(err, res) {
            if ( !!err ) {
              throw err;
            }
            
            res.header.location.should.include('/');
            done();
          });
      });

      it('should redirect to / with correct username but wrong password', function(done) {
        request(expressApp)
          .post('/auth/login')
          .type('form')
          .send({ username: "testUser", password: "wrongPassword" })
          .expect(302)
          .end(function(err, res) {
            if ( !!err ) {
              throw err;
            }
            
            res.header.location.should.include('/');
            done();
          });
      });
      
      it('should redirect to /app with correct credentials', function(done) {
        request(expressApp)
          .post('/auth/login')
          .type('form')
          .send({ username: "testUser" })
          .send({ password: defaultPasswordHash })
          .expect(302)
          .end(function(err, res) {
            if ( !!err ) {
              throw err;
            }
            
            res.header.location.should.include('/app');
            done();
          });
      });
    });
    
    describe('GET /app', function() {
      it('should redirect without credentials', function(done) {
        request(expressApp)
          .get('/app')
          .expect(302, done);
      });

      it('should stay with credentials', function(done) {
        authenticatedUserAgent
          .get('/app')
          .expect(200, done);
      });
    });
  });
  
  describe("API", function() {
    var apiPrefix = '/api';
    // v1
    describe('v1', function() {
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
    });
    
    // v2
    describe('v2', function() {
      
    });
  });
});
