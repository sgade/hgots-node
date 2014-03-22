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
                type: "admin"
              }, {
                id: 2,
                username: "testController",
                type: "controller"
              }, {
                id: 3,
                username: "testUser",
                type: "user"
              } ];
            

var authenticatedAdminAgent;
var authenticatedControllerAgent;
var authenticatedUserAgent; 

var loginUser = function(username, password, cb) {
  var server = request.agent('http://localhost:' + port);
  server
    .post('/validate_login')
    .send({ username: username, password: password })
    .end(function(err, res) {
      cb(server);
    });
};

describe('HGOTS Web Server', function() {
  before(function(done) {
    app.init(port, null, null, function() {
      app.start(function() {
        expressApp = app.getExpress();
        sequelize_fixtures.loadFixtures(require('./fixtures/test.json'), db, function() {
          loginUser("testAdmin", defaultPasswordHash, function(agent) {
            authenticatedAdminAgent = agent;
            loginUser("testController", defaultPasswordHash, function(agent) {
              authenticatedControllerAgent = agent;
              loginUser("testUser", defaultPasswordHash, function(agent) {
                authenticatedUserAgent = agent;
                done();
              });
            });
          });
        });
      });
    });
  });
  
  after(function(done) {
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
  
  describe('POST Validate Login /validate_login', function() {
    it('should respond with json', function(done) {
      request(expressApp)
        .post('/validate_login')
        .expect('Content-Type', /json/, done);
    });
    
    it('should respond with 403 without credentials', function(done) {
      request(expressApp)
        .post('/validate_login')
        .expect('Content-Type', /json/)
        .expect(403, done);
    });
    
    it('should respond with 403 with wrong credentials', function(done) {
      request(expressApp)
        .post('/validate_login')
        .send({ username: "failingUser", password: "failingPassword" })
        .expect('Content-Type', /json/)
        .expect(403, done);
    });
    
    it('should respond with 403 with correct username but wrong pass', function(done) {
      request(expressApp)
        .post('/validate_login')
        .send({ username: "testUser", password: "zulf" })
        .expect('Content-Type', /json/)
        .expect(403, done);
    });
    
    it('should respond with 200 with correct credentials', function(done) {
      var pw = require('../../crypto/').encrypt('testPassword');
      request(expressApp)
        .post('/validate_login')
        .send({ username: "testUser", password: defaultPasswordHash })
        .expect('Content-Type', /json/)
        .expect(200, done);
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
        
        it('should return all users to a controller', function(done) {
          authenticatedControllerAgent
            .get(url)
            .expect('Content-Type', /json/)
            .expect(200)
            .expect({users: users}, done);
        });
        
        it('should give a 403 to a normal user', function(done) {
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
            .send({ username: "newTestUser1", password: defaultPasswordHash, type: "user" })
            .expect('Content-Type', /json/)
            .expect(200, done);
        });
        
        it('should allow an admin to create a new controller', function(done) {
          authenticatedAdminAgent
            .post(url)
            .send({ username: "newTestController1", password: defaultPasswordHash, type: "controller" })
            .expect('Content-Type', /json/)
            .expect(200, done);
        });
        
        it('should allow an admin to create a new admin', function(done) {
          authenticatedAdminAgent
            .post(url)
            .send({ username: "newTestAdmin1", password: defaultPasswordHash, type: "admin" })
            .expect('Content-Type', /json/)
            .expect(200, done);
        });
        
        it('should allow a controller to create a new user', function(done) {
          authenticatedControllerAgent
            .post(url)
            .send({ username: "newTestUser2", password: defaultPasswordHash, type: "user" })
            .expect('Content-Type', /json/)
            .expect(200, done);
        });
        
        it('should allow a controller to create a new controller', function(done) {
          authenticatedControllerAgent
            .post(url)
            .send({ username: "newTestController2", password: defaultPasswordHash, type: "controller" })
            .expect('Content-Type', /json/)
            .expect(200, done);
        });
        
        it('should not allow a controller to create a new admin', function(done) {
          authenticatedControllerAgent
            .post(url)
            .send({ username: "newTestAdmin2", password: defaultPasswordHash, type: "admin" })
            .expect('Content-Type', /json/)
            .expect(403, done);
        });
        
        it('should not allow a normal user to create a new user', function(done) {
          authenticatedUserAgent
            .post(url)
            .send({ username: "newTestUser3", password: defaultPasswordHash, type: "user" })
            .expect('Content-Type', /json/)
            .expect(403, done);
        });
        
        it('should not allow a normal user to create a new controller', function(done) {
          authenticatedUserAgent
            .post(url)
            .send({ username: "newTestController3", password: defaultPasswordHash, type: "controller" })
            .expect('Content-Type', /json/)
            .expect(403, done);
        });
        
        it('should not allow a normal user to create a new admin', function(done) {
          authenticatedUserAgent
            .post(url)
            .send({ username: "newTestAdmin3", password: defaultPasswordHash, type: "admin" })
            .expect('Content-Type', /json/)
            .expect(403, done);
        });
      });
      
      describe('GET /users/:id/cards', function() {
        var url = prefix + "/user";
        it('should return all cards of user 3 to an admin', function(done) {
          authenticatedAdminAgent
            .get(url + "/3/cards")
            .expect('Content-Type', /json/)
            .expect(200)
            .end(function(err, res) {
              res.body.should.be.an.Array.and.an.Object.and.have.lengthOf(1);

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
              res.body.should.be.an.Array.and.an.Object.and.have.lengthOf(1);

              var card = res.body[0];
              card.should.have.properties('id', 'uid', 'UserId');
              done();
            });
        });
        
        it('should return no cards of user 1 to user 3', function(done) {
          authenticatedUserAgent
            .get(url + "/1/cards")
            .expect('Content-Type', /json/)
            .expect(403, done);
        });
        
        
        it('should give a 403 to a normal user', function(done) {
          authenticatedUserAgent
            .get(url + "/3/cards")
            .expect(403, done);
        });
      });
      
      describe('POST /user/:id/cards', function() {
        var url = prefix + "/user";
        it('should allow an admin to add a new card to a user', function() {
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
          authenticatedControllerAgent
            .post(url + '/3/cards')
            .send({uid: "42"})
            .expect(403, done);
        });
      });
      
      describe('DELETE /user/:id/card/:id', function() {
        var url = prefix + "/user/3/card/";
        
        it('should allow an admin to delete a card from a user', function(done) {
          authenticatedAdminAgent
            .del(url + '/3')
            .expect(200, done);
        });
        
        it('should allow a controller to delete a card from a user', function(done) {
          authenticatedControllerAgent
            .del(url + '/4')
            .expect(200, done);
        });
        
        it('should not allow a normal user to delete a card from a user', function(done) {
          authenticatedControllerAgent
            .del(url + '/5')
            .expect(403, done);
        });
      });
    });
  });
  
});
