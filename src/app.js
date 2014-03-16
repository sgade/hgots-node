/**
 * Main application module.
 * Project started: 16.03.2014 - 00:21
 * @module app
 * @author Sören Gade
 *
 * @requires config
 * @requires web/index
 * */

var config = require('./config');
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
