hgotsServices.factory('WebWorker', [ '$q', function($q) {
  window.$q = $q;
  var createObjectURL = window.URL.createObjectURL || window.webkitURL.createObjectURL;
  var revokeObjectURL = window.URL.revokeObjectURL || window.webkitURL.revokeObjectURL;
  
  var worker = null;
  
  return {
    _makeCodeSelfCalling: function(code) {
      return 'var ___aaa___ = ' + code.toString() + ';___aaa___();';
    },
    
    run: function(code, data) {
      var _defaultWrapper = function() {
        var code = 'RUNCODE';
        
        self.onmessage = function(e) {
          var retVal = code(e.data);
          
          postMessage(retVal);
        };
      };
      
      var regexPlaceholder = "$ &";
      _defaultWrapper = _defaultWrapper.toString();
      _defaultWrapper = _defaultWrapper.replace("'RUNCODE'", code.toString()).replace(/'RUNCODE'/g, regexPlaceholder);
      while ( _defaultWrapper.indexOf(regexPlaceholder) !== -1 ) {
        var index = _defaultWrapper.indexOf(regexPlaceholder);
        _defaultWrapper = _defaultWrapper.substr(0, index+1) + _defaultWrapper.substr(index+2, _defaultWrapper.length);
      }
      console.log(_defaultWrapper);
      var codeBlob = new Blob([ this._makeCodeSelfCalling(_defaultWrapper) ], {
        type: 'text/javascript'
      });
      var codeURL = createObjectURL(codeBlob);
      worker = new Worker(codeURL);
      
      return this.runAgain(code, data);
    },
    runAgain: function(code, data) {
      
      if ( !worker ) {
        return this.run(code, data);
      } else {
        var defer = $q.defer();
        
        worker.onmessage = function(e) {
          defer.resolve(e.data);
          worker.removeEventListener(this);
        };
        worker.onerror = function(e) {
          defer.reject(e.message);
          worker.removeEventListener(this);
        };
        
        worker.postMessage(data);
        
        return defer.promise;
      }
    }
  };
}]);
