var async = require('async');
var should = require('should');
var request = require('supertest');
var sequelize_fixtures =  require('sequelize-fixtures');

var app = require('../');
var db = require('../../db');
var expressApp = null;
var port = 3333;

var defaultPasswordHash = "fd5cb51bafd60f6fdbedde6e62c473da6f247db271633e15919bab78a02ee9eb";

var users = [ {
                id: 1,
                username: "testAdmin",
                type: "Admin",
                cards: [
                  {
                    "UserId": 1,
                    "id": 2,
                    "uid": "52"
                  },
                  {
                    "UserId": 1,
                    "id": 6,
                    "uid": "52d"
                  }
                ]
              }, {
                id: 2,
                username: "testController",
                type: "Controller",
                cards: []
              }, {
                id: 3,
                username: "testUser",
                type: "User",
                cards: [
                  {
                    "UserId": 3,
                    "id": 1,
                    "uid": "42"
                  },
                  {
                    "UserId": 3,
                    "id": 3,
                    "uid": "52a"
                  },
                  {
                    "UserId": 3,
                    "id": 4,
                    "uid": "52b"
                  },
                  {
                    "UserId": 3,
                    "id": 5,
                    "uid": "52c"
                  }
                ]
              }, {
                id: 4,
                username: "killMe",
                type: "User",
                cards: []
              } ];


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

describe('HGOTS Web Server', function() {
  this.timeout(10000);
  
  
  beforeEach(function(done) {
    app.init(port, null, null, function() {
      app.start(function() {
        expressApp = app.getExpress();
        sequelize_fixtures.loadFixtures(require('./fixtures/test.json'), db, function() {
          async.map(["testAdmin", "testController", "testUser", "killMe"], loginUser, function(err, results) {
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
  
  it('should exist', function(done) {
    should.exist(expressApp);
    done();
  });
  
  it('should be listening at localhost:' + port, function(done) {
    request(expressApp)
      .get('/')
      .expect(200, done);
  });
  
  describe('GET Main /', function() {
    it('should respond with HTML on /', function(done) {
      request(expressApp)
        .get('/')
        .expect('Content-Type', /html/)
        .expect(200, done);
    });
  });
  
  describe('POST Validate Login /auth/login', function() {
    it('should redirect to login', function(done) {
      request(expressApp)
        .post('/auth/login')
        .expect(302, done);
    });
    
    it('should respond with 403 without credentials', function(done) {
      request(expressApp)
        .post('/auth/login')
        .type('form')
        .expect(302)
        .end(function(err, res) {
          res.header.location.should.include('/');
          done();
        });
    });
    
    it('should respond with 403 with wrong credentials', function(done) {
      request(expressApp)
        .post('/auth/login')
        .type('form')
        .send({ username: "failingUser" })
        .send({ password: "failingPassword" })
        .expect(302)
        .end(function(err, res) {
          res.header.location.should.include('/');
          done();
        });
    });

    it('should respond with 403 with correct username but wrong pass', function(done) {
      request(expressApp)
        .post('/auth/login')
        .type('form')
        .send({ username: "testUser" })
        .send({ password: "zulf" })
        .expect(302)
        .end(function(err, res) {
          res.header.location.should.include('/');
          done();
        });
    });
    
    it('should respond with 200 with correct credentials', function(done) {
      request(expressApp)
        .post('/auth/login')
        .type('form')
        .send({ username: "testUser" })
        .send({ password: defaultPasswordHash })
        .expect(302)
        .end(function(err, res) {
          res.header.location.should.include('/app');
          done();
        });
    });
  });
  
  describe('GET App /app', function() {
    it('should redirect without credentials', function(done) {
      request(expressApp)
        .get('/app')
        .expect(302, done);
    });

    it('should stay with logged in user', function(done) {
      authenticatedUserAgent
        .get('/app')
        .expect(200, done);
    });
  });

  describe('API', function() {
    var prefix = '/api';
    describe('v1', function() {
      prefix += '/v1';
      describe('GET /users', function() {
        var url = prefix + '/users';
        
        it('should return all users to an admin', function(done) {
          authenticatedAdminAgent
            .get(url)
            .expect('Content-Type', /json/)
            .expect(200)
            .expect({users: users}, done);
        });
        
        it('should return only users to a controller', function(done) {
          authenticatedControllerAgent
            .get(url)
            .expect('Content-Type', /json/)
            .expect(200)
            .expect({users: users.filter(function(user) {
              return ( user.type == 'User' );
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
            .expect({user: users[2] }, done);
        });
        
        it('should return user 3 to a controller', function(done) {
          authenticatedControllerAgent
            .get(url + 3)
            .expect('Content-Type', /json/)
            .expect(200)
            .expect({ user: users[2] }, done);
        });
        
        it('should return user 3 to user 3', function(done) {
          authenticatedUserAgent
            .get(url + 3)
            .expect('Content-Type', /json/)
            .expect(200)
            .expect({ user: users[2] }, done);
        });
        
        it('should not return any user to any other user', function(done) {
          authenticatedUserAgent
            .get(url + 2)
            .expect(403, done);
        });
      });
      
      describe('PUT /users/:id', function() {
        var url = prefix + "/users/";
        
        it('should allow an admin to update user 4', function(done) {
          authenticatedAdminAgent
            .put(url + 4)
            .send({ user: { username: "killMeToo", type: 'User' } })
            .expect('Content-Type', /json/)
            .expect(200)
            .expect({ user: {id: 4, username: "killMeToo", type: "User", cards: []} }, done);
        });
        
        it('should allow a controller to update user 4', function(done) {
          authenticatedControllerAgent
            .put(url + 4)
            .send({user :{username: "killMeToo", type: 'User' } })
            .expect('Content-Type', /json/)
            .expect(200)
            .expect({user: {id: 4, username: "killMeToo", type: "User", cards: []}}, done);
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
              res.body.should.be.an.Array.and.an.Object.and.have.lengthOf(4);

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
              res.body.should.be.an.Array.and.an.Object.and.have.lengthOf(4);

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
      
      describe('POST /users/:id/cards', function() {
        var url = prefix + "/users";
        it('should allow an Admin to add a new card to a user', function(done) {
          authenticatedAdminAgent
            .post(url + '/3/cards')
            .send({uid: "42"})
            .expect(200, done);
        });
        
        it('should allow a controller to add a new card to a user', function(done) {
          authenticatedControllerAgent
            .post(url + '/3/cards')
            .send({uid: "42"})
            .expect(200, done);
        });
        
        it('should not allow a normal user to add a new card to a user', function(done) {
          authenticatedUserAgent
            .post(url + '/3/cards')
            .send({uid: "42"})
            .expect(403, done);
        });
      });
      
      describe('DELETE /users/:id/card/:id', function() {
        var url = prefix + "/users/3/card/";
        
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
  });
  
});
