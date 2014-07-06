/* Dependency */
var mdns = null;
try {
  mdns = require('mdns');
} catch(e) {
  mdns = null;
}


/**
 * The Bonjour/MDNS Server Advertisement
 * */
var ad = null;
var _mdnsIsInstalled = !!mdns;

exports.isInstalled = function(callback) {
  callback = callback || function() {};
  
  return callback(null, _mdnsIsInstalled);
};
exports.init = function(name, port, callback) {
  callback = callback || function() {};
  
  exports.isInstalled(function(err, isInstalled) {
    if ( !isInstalled ) {
      if ( process.env.NODE_ENV !== 'test' && process.env.NODE_ENV !== 'production' ) {
        console.log("mDNS module is not installed.");
      }
      return callback(null);
    }
    
    var options = {};
    
    ad = mdns.createAdvertisement(mdns.tcp(name), port, options);
    // error handler
    ad.on('error', function(error) {
      if ( error.errorCode ) {
        // dns_sd lib error
        if ( error.errorCode === mdns.kDNSServiceErr_Unknown ) {
          console.log("Unknown mDNS error.");
        }
      } else {
        throw error; // TODO: handle gracefully
      }
    });
    
    callback(null);
  });
};
exports._changeAdvertising = function(type, callback) {
  callback = callback || function() {};
  
  if ( !ad ) {
    if ( _mdnsIsInstalled ) {
      return callback(new Error('Advertisement is not initialized.'))
    }
    // mdns is not installed, ad cannot be initialized. The user should be aware of it
    return callback(null, null);
  }
  
  if ( type === 'start' ) {
    ad.start();
  } else if ( type === 'stop' ) {
    ad.stop();
  }
  
  callback(null);
};
exports.startAdvertising = function(callback) {
  exports._changeAdvertising('start', callback);
};
exports.stopAdvertising = function(callback) {
  exports._changeAdvertising('stop', callback);
};
