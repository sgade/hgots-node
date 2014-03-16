var http = require('http');
var should = require('should');

var app = require('../');
var port = 3333;
var sessionCookie = null;

describe('app', function(){
	before(function(done) {
		app.init(port, null);
		app.start(done);
	});
	
	after(function(done) {
		app.stop();
    done();
	});
  
  it('should exist', function(done) {
    should.exist(app);
    done();
  });
  
  it('should be listening at localhost:3333', function(done) {
    var headers = defaultGetOptions('/');
    http.get(headers, function(res) {
      res.statusCode.should.eql(200);
      done();
    });
  });
  
  
  function defaultGetOptions(path) {
    var options = {
      "host": "localhost",
      "port": port,
      "path": path,
      "method": "GET",
      "headers": {
        "Cookie": sessionCookie
      }
    };
    return options;
  }
});