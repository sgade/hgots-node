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
var cards = [ {
  "user_id": 1,
  "id": 1,
  "uid": "0123456789"
}, {
  "user_id": 1,
  "id": 2,
  "uid": "1234567890"
}, {
  "user_id": 2,
  "id": 3,
  "uid": "2345678901"
}, {
  "user_id": 3,
  "id": 4,
  "uid": "3456789012"
} ];

var users = [ {
  id: 1,
  username: "testAdmin",
  type: "Admin",
  cards: cards.filter(function(card) {
    return ( card.user_id === 1 );
  })
}, {
  id: 2,
  username: "testController",
  type: "Controller",
  cards: cards.filter(function(card) {
    return ( card.user_id === 2 );
  })
}, {
  id: 3,
  username: "testUser",
  type: "User",
  cards: cards.filter(function(card) {
    return ( card.user_id === 3 );
  })
}, {
  id: 4,
  username: "foo",
  type: "User",
  cards: cards.filter(function(card) {
    return ( card.user_id === 4 );
  })
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
    
    it('should listen on port ' + port, function(done) {
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
  
  /* ************************************************************
   * ********************  API descriptions  ********************
   * ************************************************************
   * */
  describe("API", function() {
    var apiPrefix = '/api';
    
    // v2
    describe('v2', function() {
      var prefix = apiPrefix + '/v2';
      
      describe('GET /users', function() {
        var url = prefix + '/users';
        
        it('should return all users to an admin', function(done) {
          authenticatedAdminAgent
            .get(url)
            .expect('Content-Type', /json/)
            .expect(200)
            .expect({
              users: users
            }, done);
        });
        
        it('should return only users to a controller', function(done) {
          authenticatedControllerAgent
            .get(url)
            .expect('Content-Type', /json/)
            .expect(200)
            .expect({
              users: users.filter(function(user) {
                return ( user.type === "User" );
              })
            }, done);
        });
        
        it('should be forbidden for users', function(done) {
          authenticatedUserAgent
            .get(url)
            .expect('Content-Type', /json/)
            .expect(403)
            .expect({ error: "Forbidden" }, done);
        });
        
        it('should be forbidden for everyone else', function(done) {
          request(expressApp)
            .get(url)
            .expect('Content-Type', /json/)
            .expect(403)
            .expect({ error: "Forbidden" }, done);
        });
        
      });
      
      describe('GET /users/:id', function() {
        var url = prefix + '/users/';
        var admin = users.filter(function(user) {
          return ( user.type === "Admin" );
        })[0];
        var controller = users.filter(function(user) {
          return ( user.type === "Controller" );
        })[0];
        var user = users.filter(function(user_) {
          return ( user_.type === "User" );
        })[0];
        
        // Admin (3x)
        it('should return an admin to an admin', function(done) {
          authenticatedAdminAgent
            .get(url + admin.id)
            .expect('Content-Type', /json/)
            .expect(200)
            .expect({ user: admin }, done);
        });
        
        it('should return a controller to an admin', function(done) {
          authenticatedAdminAgent
            .get(url + controller.id)
            .expect('Content-Type', /json/)
            .expect(200)
            .expect({ user: controller }, done);
        });
        
        it('should return an user to an admin', function(done) {
          authenticatedAdminAgent
            .get(url + user.id)
            .expect('Content-Type', /json/)
            .expect(200)
            .expect({ user: user }, done);
        });
        
        // Controller (3x)
        it('should not return an admin to a controller', function(done) {
          authenticatedControllerAgent
            .get(url + admin.id)
            .expect('Content-Type', /json/)
            .expect(403)
            .expect({ error: "Forbidden" }, done);
        });
        
        it('should not return a controller to a controller', function(done) {
          authenticatedControllerAgent
            .get(url + controller.id)
            .expect('Content-Type', /json/)
            .expect(403)
            .expect({ error: "Forbidden" }, done);
        });
        
        it('should return an user to a controller', function(done) {
          authenticatedControllerAgent
            .get(url + user.id)
            .expect('Content-Type', /json/)
            .expect(200)
            .expect({ user: user }, done);
        });
        
        // User 3x
        it('should not return an admin to an user', function(done) {
          authenticatedUserAgent
            .get(url + admin.id)
            .expect('Content-Type', /json/)
            .expect(403)
            .expect({ error: "Forbidden" }, done);
        });
        
        it('should not return a controller to an user', function(done) {
          authenticatedUserAgent
            .get(url + controller.id)
            .expect('Content-Type', /json/)
            .expect(403)
            .expect({ error: "Forbidden" }, done);
        });
        
        it('should not return an user to an user', function(done) {
          authenticatedUserAgent
            .get(url + user.id)
            .expect('Content-Type', /json/)
            .expect(403)
            .expect({ error: "Forbidden" }, done);
        });
        
      });
      
      describe('POST /users', function() {
        var url = prefix + '/users';
        var newID = users.length + 1;
        var admin = { user: { username: 'test', password: defaultPasswordHash, type: 'Admin' } };
        var controller = { user: { username: 'test', password: defaultPasswordHash, type: 'Controller' } };
        var user = { user: { username: 'test', password: defaultPasswordHash, type: 'User' } };
        
        // For admin (3x)
        it('should allow an admin to create an admin', function(done) {
          authenticatedAdminAgent
            .post(url)
            .send(admin)
            .expect('Content-Type', /json/)
            .expect(201)
            .expect({ user: { id: newID, username: admin.user.username, type: admin.user.type } }, done);
        });
        
        it('should allow an admin to create a controller', function(done) {
          authenticatedAdminAgent
            .post(url)
            .send(controller)
            .expect('Content-Type', /json/)
            .expect(201)
            .expect({ user: { id: newID, username: controller.user.username, type: controller.user.type } }, done);
        });
        
        it('should allow an admin to create an user', function(done) {
          authenticatedAdminAgent
            .post(url)
            .send(user)
            .expect('Content-Type', /json/)
            .expect(201)
            .expect({ user: { id: newID, username: user.user.username, type: user.user.type } }, done);
        });
        
        // For controller (3x)
        it('should not allow a controller to create an admin', function(done) {
          authenticatedControllerAgent
            .post(url)
            .send(admin)
            .expect('Content-Type', /json/)
            .expect(403)
            .expect({ error: "Forbidden" }, done);
        });
        
        it('should not allow a controller to create a controller', function(done) {
          authenticatedControllerAgent
            .post(url)
            .send(controller)
            .expect('Content-Type', /json/)
            .expect(403)
            .expect({ error: "Forbidden" }, done);
        });
        
        it('should allow a controller to create an user', function(done) {
          authenticatedControllerAgent
            .post(url)
            .send(user)
            .expect('Content-Type', /json/)
            .expect(201)
            .expect({ user: { id: newID, username: user.user.username, type: user.user.type } }, done);
        });
        
        // For user (3x)
        it('should not allow an user to create an admin', function(done) {
          authenticatedUserAgent
            .post(url)
            .send(admin)
            .expect('Content-Type', /json/)
            .expect(403)
            .expect({ error: "Forbidden" }, done);
        });
        
        it('should not allow an user to create a controller', function(done) {
          authenticatedUserAgent
            .post(url)
            .send(controller)
            .expect('Content-Type', /json/)
            .expect(403)
            .expect({ error: "Forbidden" }, done);
        });
        
        it('should not allow an user to create an user', function(done) {
          authenticatedUserAgent
            .post(url)
            .send(user)
            .expect('Content-Type', /json/)
            .expect(403)
            .expect({ error: "Forbidden" }, done);
        });
        
      });
      
      describe('PUT /users/:id', function() {
        var url = prefix + '/users/';
        
        var admin = users.filter(function(user) {
          return ( user.type === "Admin" );
        })[0];
        var controller = users.filter(function(user) {
          return ( user.type === "Controller" );
        })[0];
        var user = users.filter(function(user_) {
          return ( user_.type === "User" );
        })[0];
        
        // Admin (3x)
        it('should allow an admin to update an admin', function(done) {
          authenticatedAdminAgent
            .put(url + admin.id)
            .send({ user: { username: "changed" } })
            .expect('Content-Type', /json/)
            .expect(200)
            .expect({ user: { id: admin.id, type: admin.type, cards: admin.cards, username: "changed" } }, done);
        });
        
        it('should allow an admin to update a controller', function(done) {
          authenticatedAdminAgent
            .put(url + controller.id)
            .send({ user: controller })
            .expect('Content-Type', /json/)
            .expect(200)
            .expect({ user: controller }, done);
        });
        
        it('should allow an admin to update an user', function(done) {
          authenticatedAdminAgent
            .put(url + user.id)
            .send({ user: user })
            .expect('Content-Type', /json/)
            .expect(200)
            .expect({ user: user }, done);
        });
        
        // Controller (3x)
        it('should not allow a controller to update an admin', function(done) {
          authenticatedControllerAgent
            .put(url + admin.id)
            .send({ user: admin })
            .expect('Content-Type', /json/)
            .expect(403)
            .expect({ error: "Forbidden" }, done);
        });
        
        it('should not allow a controller to update a controller', function(done) {
          authenticatedControllerAgent
            .put(url + controller.id)
            .send({ user: controller })
            .expect('Content-Type', /json/)
            .expect(403)
            .expect({ error: "Forbidden" }, done);
        });
        
        it('should allow a controller to update an user', function(done) {
          authenticatedControllerAgent
            .put(url + user.id)
            .send({ user: user })
            .expect('Content-Type', /json/)
            .expect(200)
            .expect({ user: user }, done);
        });
        
        // User (3x)
        it('should not allow an user to update an admin', function(done) {
          authenticatedUserAgent
            .put(url + admin.id)
            .send({ user: admin })
            .expect('Content-Type', /json/)
            .expect(403)
            .expect({ error: "Forbidden" }, done);
        });
        
        it('should not allow an user to update a controller', function(done) {
          authenticatedUserAgent
            .put(url + controller.id)
            .send({ user: controller })
            .expect('Content-Type', /json/)
            .expect(403)
            .expect({ error: "Forbidden" }, done);
        });
        
        it('should not allow an user to update an user', function(done) {
          authenticatedUserAgent
            .put(url + user.id)
            .send({ user: user })
            .expect('Content-Type', /json/)
            .expect(403)
            .expect({ error: "Forbidden" }, done);
        });
        
      });
      
    });
  });
});
