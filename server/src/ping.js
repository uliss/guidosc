var inherits = require('inherits');
var utils = require('./utils');
var mod = require('./module.js');

function Ping(app_global) {
    mod.Module.call(this, app_global, 'ping');
    this.addCommand("ping", "ping server", function() {
        return "pong";
    });
}

inherits(Ping, mod.Module);

Ping.prototype.bindClient = function (socket) {

};

function ping_bind_socket(app_global, socket) {
    socket.on(node_path('/ping'), function() {
        app_global.io.emit(cli_path('/pong'));
    });
}


module.exports = Ping;
