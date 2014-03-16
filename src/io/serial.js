/**
 * A general serial port helper.
 * @module io/serial
 * @author Sören Gade
 *
 * @requires serialport
 * */

var serialport = require('serialport');

/**
 * A callback that is called with two parameters.
 * @callback ErrorResultCallback
 * @param {Exception} err - Is an error object or null.
 * @param {Object} object - The resulting data.
 * */
/**
 * Lists all serial port devices found on the device.
 * @param {ErrorResultCallback} callback - A callback that is called upon finish or error.
 * */
exports.list = function(callback) {
  serialport.list(callback);
};
