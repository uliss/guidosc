/**
 *  User Interface module for SuperCollider via WebSockets
 *
 * transfer osc://node/widget/add => socket://widget/add

 * API IN:
 * /widget/add JSON
 * /widget/remove JSON
 * /widget/update JSON
 * /widget/command JSON
*/
var mod = require('./module.js');
var inherits = require('inherits');
var log = require('./utils.js').log('ui')
var gUI;

function UI(app) {
    mod.Module.call(this, app, "ui");
    this.bindOSC("/widget/add");
    this.bindOSC("/widget/update");
    this.bindOSC("/widget/command");
    this.bindOSC("/widget/remove");
}

inherits(UI, mod.Module);

UI.prototype.bindOSC = function(path) {
    var $this = this;
    this.onOSC(node_path(path),
        function(msg, rinfo) {
            try {
                if (msg.length < 2) {
                    throw new Error("Argument required!");
                }

                $this.send2Client(path, JSON.parse(msg[1]));
            } catch (e) {
                log.error("%s: %s", e.message, msg.join(' '));
            }
        });
};

UI.prototype.send2Client = function(path, msg) {
    log.debug(cli_path(path), JSON.stringify(msg));
    this.app_global.io.emit(cli_path(path), msg);
};

UI.prototype.send2Supercollider = function(path, id, msg) {
    this.oscSend(sc_path(path) + "/" + id, msg);
};

UI.prototype.bindSocket = function(socket) {
    socket.on(node_path('/ui'), function(msg) {
        log.debug('nexus UI:', JSON.stringify(msg));
        if (msg.length == 2) {
            this.send2Supercollider("/ui", msg[0], msg[1]);
        } else if (msg.length > 2) {
            this.send2Supercollider("/ui", msg[0], msg.slice(1));
        } else {
            this.send2Supercollider("/ui", msg, "");
        }
    });
};

function init(app_global) {
    gUI = new UI(app_global);
}

function bindSocket(app_global, socket) {
    gUI.bindSocket(socket);
}

module.exports.init = init;
module.exports.bindSocket = bindSocket;
