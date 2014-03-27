var serialport = require('serialport');
var SerialPort = serialport.SerialPort;

function openPort(port) {
  var serialPort = new SerialPort(port, {
    parser: serialport.parsers.readline('\n')
  });
  serialPort.on('open', function(err) {
    serialPort.on('data', function(data) {
      console.log("Data from", port,":", data);
    });
  });
}

serialport.list(function(err, results) {
  results.forEach(function(result) {
    console.log(result);
  });
});
// open a port to test...
//openPort('/dev/cu.usbserial');
