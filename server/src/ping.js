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

module.exports = Ping;
