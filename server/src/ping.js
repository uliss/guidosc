var inherits = require('inherits');
var utils = require('./utils');
var mod = require('./module.js');
var log = utils.log('ping');

/**
 * @constructor
 */
function Ping(app_context) {
    mod.Module.call(this, app_context, 'ping');
    this.addCommand("ping", "ping server", function(msg) {
        return msg[0];
    });
}

inherits(Ping, mod.Module);

module.exports = Ping;
