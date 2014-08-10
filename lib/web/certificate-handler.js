var fs = require('fs');
var crypto = require('crypto');
var path = require('path');
var config = require('./../config');

var loadedCertificates = {};

exports._isCertificateLoaded = function(name) {
  var loaded = !!loadedCertificates[name];
  return loaded;
};
exports._getCertificateFromCache = function(name) {
  if ( !exports._isCertificateLoaded(name) ) {
    throw new Error('Certificate for "' + name + '" is not loaded.');
  }
    
  return loadedCertificates[name];
};

exports._checkForCertificateFiles = function(name) {
  var basePath = './ssl/';
  var privateKeyPath = path.join(basePath, name + '.key');
  var certificatePath = path.join(basePath, name + '.crt');
  
  if ( !fs.existsSync(privateKeyPath) ) {
    throw new Error('No private key found for host "' + name + '".');
  }
  if ( !fs.existsSync(certificatePath) ) {
    throw new Error('No certificate found for host "' + name + '".');
  }
  
  var privateKey = fs.readFileSync(privateKeyPath);
  var certificate = fs.readFileSync(certificatePath);
  
  return {
    key: privateKey,
    cert: certificate,
    passphrase: config.web.sslCertificatePassphrase
  };
};
exports._loadCertificateFromDisk = function(name) {
  var data = exports._checkForCertificateFiles(name);
  
  loadedCertificates[name] = data;
  console.log("Loaded certificate \"" + name + "\".");
    
  return data;
};

exports.getCertificateForHostname = function(hostname) {
  if ( exports._isCertificateLoaded(hostname) ) {
    return exports._getCertificateFromCache(hostname);
  } else {
    return exports._loadCertificateFromDisk(hostname);
  }
};
