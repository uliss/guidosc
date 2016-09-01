var io = require('socket.io-client');
var utils = require('./utils.js');
var socket;
if (utils.is_server()) {
    socket = io('http://localhost');
} else {
    socket = io();
}

var debug = false;

function send_to_sc(path) {
    var args = [path].concat(Array.prototype.slice.call(arguments, 1));
    if (debug) console.log(args);
    socket.emit("/guido/forward", args);
}

function from_sc(path, func) {
    socket.on(path, func);
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
