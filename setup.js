/**
 * This is the setup module.
 * It is supposed to help you create the correct environment to start the app.
 * For more information on how to use this script or on how to start the application,
 * please read README.md.
 * */

var exec = require('child_process').exec;
var fs = require('fs');

function copyFileSync(src, dest) {
  var data = fs.readFileSync(src);
  fs.writeFileSync(dest, data);
}
function isInstalled(app, callback) {
  var cmd = "which " + app;
  exec(cmd, function(err, stdout, stderr) {
    var isInstalled = !err;
    callback(isInstalled);
  });
}

function npmInstall(callback) {
  exec("npm install", function(err, stdout, stderr) {
    callback(err);
  });
}
function bowerInstall(callback) {
  exec("bower install", function(err, stdout, stderr) {
    callback(err);
  });
}

function ensureGrunt(callback) {
  callback = callback || function() {};
  isInstalled("grunt", function(isInstalled) {
    if ( !isInstalled ) {
      exec("npm install -g grunt-cli", function(err, stdout, stderr) {
        callback(err);
      });
    } else {
      callback();
    }
  });
}
function ensureBower(callback) {
  callback = callback || function() {};
  isInstalled("bower", function(isInstalled) {
    if ( !isInstalled ) {
      exec("npm install -g bower", function(err, stdout, stderr) {
        callback(err);
      });
    } else {
      callback();
    }
  });
}

// First, check if there is a config.json
if ( !fs.existsSync('config.json') ) {
  console.log("You need to create a config.json file that tells the application your preferences.");
  console.log("Copying file for you...");
  copyFileSync('config.example.json', 'config.json');
  console.log("Done.");
} else {
  console.log("Good. You already have a config file for the application.");
}

console.log("We are installing dependencies, just to be sure...");
console.log("You need npm and bower installed.");
console.log("----- npm install -----");
npmInstall(function(err) {
  
  console.log("Installing grunt...");
  ensureGrunt(function(err2) {
    console.log("Installing bower...");
    ensureBower(function(err3) {
      
      console.log("----- bower install -----");
      bowerInstall(function(err4) {
        console.log("All done.");
      });
      
    });
  });
  
});
