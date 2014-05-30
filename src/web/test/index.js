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
  cards: [ 2, 6 ]
}, {
  id: 2,
  username: "testController",
  type: "Controller",
  cards: []
}, {
  id: 3,
  username: "testUser",
  type: "User",
  cards: [ 1, 3, 4, 5 ]
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
  "UserId": 3,
  "id": 1,
  "uid": "42"
}, {
  "UserId": 3,
  "id": 3,
  "uid": "52a"
}, {
  "UserId": 3,
  "id": 4,
  "uid": "52b"
}, {
  "UserId": 3,
  "id": 5,
  "uid": "52c"
}];

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
  });
  
  describe("API", function() {
    
  });
});
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

});

});
