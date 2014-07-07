var fs = require('fs');
var crypto = require('crypto');
var path = require('path');
var config = require('./../config');

var loadedCertificates = {};

exports._isCertificateLoaded = function(name, callback) {
  var loaded = !!loadedCertificates[name];
  return callback(null, loaded);
};
exports._getCertificateFromCache = function(name, callback) {
  return exports._isCertificateLoaded(name, function(err, isLoaded) {
    if ( !!err || !isLoaded ) {
      return callback(new Error('Certificate for "' + name + '" is not loaded.'))
    }
    
    return callback(null, loadedCertificates[name]);
  });
};

exports._checkForCertificateFiles = function(name, callback) {
  var basePath = './ssl/';
  var privateKeyPath = path.join(basePath, name + '.key');
  var certificatePath = path.join(basePath, name + '.crt');
  
  return fs.exists(privateKeyPath, function(exists) {
    if ( !exists ) {
      return callback(new Error('No private key found for host "' + name + '".'));
    }
    return fs.exists(certificatePath, function(exists) {
      if ( !exists ) {
        return callback(new Error('No certificate found for host "' + name + '".'));
      }
      
      return fs.readFile(privateKeyPath, function(err, privateKey) {
        if ( !!err ) {
          return callback(err);
        }
        return fs.readFile(certificatePath, function(err, certificate) {
          if ( !!err ) {
            return callback(err);
          }
          
          return callback(null, {
            key: privateKey,
            cert: certificate,
            passphrase: config.web.sslPassphrase
          });
        });
      });
    });
  });
};
exports._loadCertificateFromDisk = function(name, callback) {
  return exports._checkForCertificateFiles(name, function(err, data) {
    if ( !!err ) {
      return callback(err);
    }
    
    loadedCertificates[name] = data;
    
    return callback(null, data);
  });
};

exports.getCertificateForHostname = function(hostname, callback) {
  return exports._isCertificateLoaded(hostname, function(err, isLoaded) {
    if ( isLoaded ) {
      return exports._getCertificateFromCache(hostname, callback);
    } else {
      return exports._loadCertificateFromDisk(hostname, callback);
    }
  })
};
