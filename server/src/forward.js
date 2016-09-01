var inherits = require('inherits');
var utils = require('./utils');
var mod = require('./module.js');
var log = utils.log('forward');

/**
 * @constructor
 */
function Forward(app_context) {
    mod.Module.call(this, app_context, 'forward');
    this.bindOsc();
}

inherits(Ping, mod.Module);

Forward.prototype.bindOsc = function() {
    var io = this.app_global.io;

    this.onOSC("/guido/forward", function(msg, rinfo) {
        if (msg.length < 2) {
            log.error("forward:", "invalid argument count");
            return;
        }

        var path = msg[1];
        var args = msg.slice(2);
        log.verbose('master => client: %s %s', path, args.join(' '));
        io.emit(path, args);
    });
};

Forward.prototype.bindSocket = function(socket) {
    mod.Module.prototype.bindSocket.call(this, socket);
    var self = this;

    socket.on("/guido/forward", function(msg) {
        try {
            var path = msg[0];
            var args = msg.slice(1);

            switch (msg.length) {
                case 0:
                    log.error("Invalid forward message format. Should be: DEST_PATH [ARGS]");
                    break;
                case 1:
                    log.verbose('client => master:', path);
                    self.oscClient().send(path);
                default:
                    {
                        log.verbose('client => master: %s %s', path, args.join(' '));
                        self.oscClient().send(path, args);
                    }
            }
        } catch (e) {
            log.error(e.message);
        }
    });
};

module.exports = Forward;
module.exports._test = {
    log: log
};
