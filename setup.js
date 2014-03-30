/**
 * This is the setup module.
 * It is supposed to help you create the correct environment to start the app.
 * For more information on how to use this script or on how to start the application,
 * please read README.md.
 *
 * @mdoule setup
 * @author Sören Gade
 * */

/* Our requirements */
var exec = require('child_process').exec;
var fs = require('fs');

/** ========== ========== ==========
 * Helpers
 *  ========== ========== ==========
 * */

/**
 * Copies a file synchronioulsy.
 * @param {String} src - The source path of the file that should be copied.
 * @param {String} dest - The destiation path of the copy.
 * */
function copyFileSync(src, dest) {
  var data = fs.readFileSync(src); // read all the data from the file
  fs.writeFileSync(dest, data); // write the data into the new file
}
/**
 * Checks if the given command line application is installed.
 * @param {String} app - The command that should be installed.
 * @param {SuccessCallback} callback - A callback that defines whether the tool is installed.
 * */
function isInstalled(app, callback) {
  var cmd = "which " + app; // use 'which' to determine path => it then is installed
  exec(cmd, function(err, stdout, stderr) {
    var isInstalled = !err;
    callback(isInstalled);
  });
}

/** ========== ========== ==========
 * Executed commands
 *  ========== ========== ==========
 * */
/**
 * Executes 'npm install'.
 * @param {ErrorCallback} callback - A callback that is called once the operation finished.
 * */
function npmInstall(callback) {
  exec("npm install", function(err, stdout, stderr) {
    callback(err);
  });
}
/**
 * Executes 'bower install'.
 * @param {ErrorCallback} callback - A callback that is called once the operation finished.
 * */
function bowerInstall(callback) {
  exec("bower install", function(err, stdout, stderr) {
    callback(err);
  });
}

/**
 * Ensures that grunt is installed.
 * @param {ErrorCallback} callback - A callback that is called once the operation finished.
 * */
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
/**
 * Ensures that bower is installed.
 * @param {ErrorCallback} callback - A callback that is called once the operation finished.
 * */
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
