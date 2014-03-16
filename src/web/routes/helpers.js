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
  
  if ( user == "admin" && pw == "admin" ) { // TODO read from config
    callback(true);
  } else {
    db.User.find({
      where: {
        username: user,
        password: pw
      }
    }).complete(function(err, user) {
      if ( err ) {
        throw err; // TODO handle error!
      } else {
      
        var ok = !!user;
        callback(ok);
      
      }
    });
  }
}
exports.validateUser = validateUser;

function validateRequest(req, callback) {
  validateUser(req.session.username, req.session.password, callback);
}
exports.validateRequest = validateRequest;
