var should = require('should');
var request = require('supertest');

var app = require('../');
var expressApp = null;
var port = 3333;

describe('app', function(){
	before(function(done) {
		app.init(port, null);
		app.start(function() {
      expressApp = app.getExpress();
      done();
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
  
  it('should be listening at localhost:3333 on /', function(done) {
    request(expressApp)
      .get('/')
      .expect(200, done);
  });
  
  it('should respond with HTML on /', function(done) {
    request(expressApp)
      .get('/')
      .expect('Content-Type', /html/)
      .expect(200, done);
  });
});