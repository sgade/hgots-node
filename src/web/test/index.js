var should = require('should');
var request = require('supertest');
var sequelize_fixtures =  require('sequelize-fixtures');

var app = require('../');
var db = require('../../db');
var expressApp = null;
var port = 3333;

describe('HGOTS Web Server', function() {
  before(function(done) {
    app.init(port, null);
    app.start(function() {
      expressApp = app.getExpress();
      sequelize_fixtures.loadFixtures(require('./fixtures/test.json'), db, done);
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
        .expect(403, done);
    });
    
    it('should respond with 403 with wrong credentials', function(done) {
      request(expressApp)
        .post('/validate_login')
        .send({ username: "failingUser", password: "failingPassword" })
        .expect(403, done);
    });
    
    it('should respond with 200 with correct credentials', function(done) {
      var pw = require('../../crypto/').encrypt('testPassword');
      request(expressApp)
        .post('/validate_login')
        .send({ username: "testUser", password: "fd5cb51bafd60f6fdbedde6e62c473da6f247db271633e15919bab78a02ee9eb" })
        .expect(200, done);
    });
  });
  
  describe('App /app', function() {
    it('should redirect with credentials', function(done) {
      request(expressApp)
        .get('/app') // TODO: somehow get the server to love our credentials
        .expect(302, done);
    });
  });
  
});
