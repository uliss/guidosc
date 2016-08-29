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
        if (args.length < 1) {
            log.error('redirect:', 'no URL given');
            return;
        }

        log.verbose('redirect to:', args[0]);
        this.broadcast(['redirect', args[0]]);
    });

    this.addCommand('title', 'set page and window title on connected clients', function(args) {
        if (args.length == 0) {
            log.error("none title given");
            return;
        }

        log.verbose('title:', args);
        if (args.length == 1)
            this.broadcast(['title', args[0]]);
        if (args.length == 2)
            this.broadcast(['title', args[0], args[1]]);
    });

    this.addCommand('alert', 'shows alert modal window on all connected clients', function(args) {
        if(args.length != 3) {
            log.error('alert:', 'invalid argument count');
            return;
        }

        var type = args[0];
        var title = args[1];
        var subject = args[2];

        log.verbose('%s message: [%s] - %s', type, title, subject);
        this.broadcast(['alert', type, title, subject]);
    });
}

inherits(Client, mod.Module);

module.exports = Client;
