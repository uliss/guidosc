var io = require('socket.io-client');
var utils = require('./utils.js');
var socket = io();

var debug = false;

/**
 * @param {string} path - destination path on master
 * @param {array} var_args
 */
function send_to_sc(path, var_args) {
    var args = [path].concat(Array.prototype.slice.call(arguments, 1));
    if (debug) console.log(args);
    socket.emit("/guido/forward", args);
}

function from_sc(path, func) {
    socket.on(path, func);
}

function once_from_sc(path, func) {
    socket.once(path, func);
}

function send(path, args, fn) {
    if (args === undefined)
        socket.emit(path);
    else
        socket.emit(path, args, fn);
}

function on(path, callback) {
    socket.on(path, function(msg) {
        callback(msg);
    });
}

module.exports.send = send;
module.exports.on = on;

// forward
module.exports.send_to_sc = send_to_sc;
module.exports.from_sc = from_sc;

// socket
module.exports.socket = socket;
