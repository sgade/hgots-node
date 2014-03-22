var should = require('should');
var request = require('supertest');
var sequelize_fixtures =  require('sequelize-fixtures');

var app = require('../');
var db = require('../../db');
var expressApp = null;
var port = 3333;

var defaultPasswordHash = "fd5cb51bafd60f6fdbedde6e62c473da6f247db271633e15919bab78a02ee9eb";

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
  
  describe('Main /', function() {
    it('should respond with HTML on /', function(done) {
      request(expressApp)
        .get('/')
        .expect('Content-Type', /html/)
        .expect(200, done);
    });
  });
  
  describe('Validate Login /validate_login', function() {
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
  
  describe('App /app', function() {
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
  
});
