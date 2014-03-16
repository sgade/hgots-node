/**
 * Main application module
 * @module app
 * @author Sören Gade
 * Project started: 16.03.2014 - 00:21
 * */

var web = require('./web/');

console.log("Hello World!");
console.log("This is going to be a full featured door lock system.");

function startWeb() {
  web.init();
  web.start(function() {
    console.log("Web interface running.");
  });
}

function main() {
  startWeb();
}
main();
