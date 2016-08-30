var inherits = require('inherits');
var utils = require('./utils');
var mod = require('./module.js');
var log = utils.log('ping');

function Ping(app_global) {
    mod.Module.call(this, app_global, 'ping');
    this.addCommand("ping", "ping server", function(msg) {
        return msg;
    });
}

inherits(Ping, mod.Module);

module.exports = Ping;
