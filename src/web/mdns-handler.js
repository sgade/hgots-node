/* Dependency */
var mdns = null;
try {
  mdns = require('mdns');
} catch(e) {
  mdns = null;
}

function mDNSAdvertiser(name, port) {
  this._mdnsIsInstalled = !!mdns;
  /**
   * The Bonjour/MDNS Server Advertisement
   * */
  this.ad = null;
  
  this.isInstalled = function(callback) {
    callback = callback || function() {};
    return callback(null, this._mdnsIsInstalled);
  };
  
  this._init = function(callback) {
    callback = callback || function() {};
    
    if ( !this._mdnsIsInstalled ) {
      if ( process.env.NODE_ENV !== 'test' && process.env.NODE_ENV !== 'production' ) {
        console.log("mDNS module is not installed.");
      }
      return callback(null);
    }
    
    if ( !!this.ad ) {
      return callback(new Error('Advertisement already created.'));
    }
    
    var options = {};
    this.ad = mdns.createAdvertisement(mdns.tcp(name), port, options);
    // error handler
    this.ad.on('error', function(error) {
      if ( error.errorCode ) {
        // dns_sd lib error
        if ( error.errorCode === mdns.kDNSServiceErr_Unknown ) {
          console.log("Unknown mDNS error.");
        }
      } else {
        throw error; // TODO: handle gracefully
      }
    });
    
    return callback(null);
  };
  
  var _changeAdvertising = function(type, callback) {
    callback = callback || function() {};
    
    if ( !this.ad ) {
      if ( this._mdnsIsInstalled ) {
        return callback(new Error('Advertisement is not initialized.'));
      }
      // mdns is not installed, ad cannot be initialized. The user should be aware of it
      return callback(null, null);
    }
    
    if ( type === 'start' ) {
      this.ad.start();
    } else if ( type === 'stop' ) {
      this.ad.stop();
      this.ad = null;
    }
    
    callback(null);
  };
  
  this.startAdvertising = function(callback) {
    var self = this;
    
    self._init(function(err) {
      _changeAdvertising.call(self, 'start', callback);
    });
  };
  this.stopAdvertising = function(callback) {
    _changeAdvertising.call(this, 'stop', callback);
  };
}

module.exports = {
  mDNSAdvertiser: mDNSAdvertiser,
};
