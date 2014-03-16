/*
 * Routes
 * */

var db = require('../../db/');

/**
 * @param {String} user
 * @param {String} pw
 * @param {SuccessCallback} callback
 * */
function validateUser(user, pw, callback) {
  if ( !user || !pw ) {
    callback(false);
    return;
  }
  
  if ( user == "admin" && pw == "admin" ) {
    callback(true);
  } else {
    db.User.find({
      where: {
        username: user,
        password: pw
      }
    }).complete(function(err, user) {
      if ( err ) {
        throw err; // TODO
      } else {
      
        var ok = !!user;
        callback(ok);
      
      }
    });
  }
}

/* Default route */
exports.index = function(req, res) {
  validateUser(req.session.username, req.session.password, function(ok) {
    
    if ( ok ) {
      res.redirect("/app");
    } else {
      res.render('index', {
        title: 'hgots-node'
      });
    }
    
  });
};
exports.validateLogin = function(req, res) {
  var params = req.body;
  var username = params.username,
    password = params.password;
  
  var msg = {
    statusCode: 200,
    message: "OK"
  };
  
  validateUser(username, password, function(ok) {
    
    if ( !ok ) {
      msg.statusCode = 403;
      msg.message = "Invalid credentials.";
    } else {
      req.session.username = username;
      req.session.password = password;
    }
    
    res.status(msg.statusCode).set({
      'Content-Type': 'application/json'
    });
    res.end(JSON.stringify(msg));
    
  });
};
exports.logout = function(req, res) {
  req.session.username = "";
  req.session.password = "";
  
  res.redirect('/');
};

exports.app = function(req, res) {
  validateUser(req.session.username, req.session.password, function(ok) {
    
    if ( !ok ) {
      res.redirect('/');
    } else {
      res.render('app', {
        title: 'hgots-node'
      });
    }
    
  });
};
