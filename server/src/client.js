var inherits = require('inherits');
var utils = require('./utils');
var mod = require('./module.js');
var log = utils.log('client');

function Client(app_global) {
    mod.Module.call(this, app_global, 'client');

    this.addCommand('css', 'set CSS style on all clients', function(msg) {
        if (msg.length < 2) {
            log.error("css: invalid argument count");
            return;
        }

        if (msg.length == 3) {
            var sel = msg[0];
            var key = msg[1];
            var val = msg[2];

            log.verbose('set css: %s { %s: %s }', sel, key, val);
            this.broadcast(['css', sel, key, val], 'socket');
        }

        if (msg.length == 2) {
            var sel = msg[0];
            var css = msg[1];

            log.verbose('set css: %s %s', sel, css);
            this.broadcast(['css', sel, css], 'socket');
        }
    });

    this.addCommand('reload', 'reload page on all connected clients', function() {
        log.verbose('reloading page...');
        this.broadcast(['reload'], 'socket');
    });

    this.addCommand('redirect', 'redirects all connected clients to other URL', function(args) {
        if(args.length < 1) {
            log.error('redirect:', 'no URL given');
            return;
        }

        log.verbose('redirect to:', args[0]);
        this.broadcast(['redirect', args[0]]);
    });
}

inherits(Client, mod.Module);

module.exports = Client;
