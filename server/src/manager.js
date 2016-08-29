var inherits = require('inherits');
var _ = require('underscore');
var util = require('util');
var mod = require('./module.js');
var utils = require('./utils.js');
var log = utils.log();

function Manager(app_global) {
    mod.Module.call(this, app_global, 'manager');
    // conneted web socket clients
    this.clients = {};
    this.addCommand('list', 'list connected clients', function(opts) {
        return Object.keys(this.clients);
    });
}

inherits(Manager, mod.Module);

Manager.prototype.bindClient = function(socket) {
    var addr = socket.request.connection.remoteAddress.substring(7);
    if(!addr) addr = "127.0.0.1";

    log.verbose('client %s connected', addr);
    this.clients[addr] = { sock: socket };

    var self = this;
    socket.on('disconnect', function() {
        log.verbose('client %s disconnected', addr);
        delete self.clients[addr];
    });
};


module.exports = Manager;
