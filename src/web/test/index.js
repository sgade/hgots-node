var app = require('../');
var port = 3333;

describe('app', function(){
	before(function(done) {
		app.init(port, null);
		app.start(done);
	});
	
	after(function(done) {
		app.stop();
	});
});