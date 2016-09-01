var utils = require('./utils');
var log = utils.log('server');
var mod = require('./module.js');
var inherits = require('inherits');

const VERSION = "0.0.1";

function Server(app_global) {
    mod.Module.call(this, app_global, 'server');

    // URL -> server path (without '.html' extension)
    this.MODULE_ROUTES = {
        "/speakers": "/speakers",
        "/info": "/info",
        "/vlabel": "/vlabel",
        "/vmetro": "/vmetro",
        "/concert": "/concert",
        "/piece": "/piece",
        "/ui": "/ui",
        "/timer": "/timer",
        "/tone": "/tone",
        "/tests": "/tests",
        "/utils": "/utils",
        "/": "/index"
    };

    this.sync_pages = {};

    this.addCommand('pages', 'list available pages', function(msg) {
        return Object.keys(this.MODULE_ROUTES);
    });

    this.addCommand('sync_add', 'adds given url to sync list', function(args) {
        this.sync_pages[args[0]] = true;
    });

    this.addCommand('sync_remove', 'remove given url to sync list', function(args) {
        delete this.sync_pages[args[0]];
    });

    this.addCommand('sync_list', 'get sync list', function(args) {
        return Object.keys(this.sync_pages);
    });

    this.addCommand('version', 'returns server version', function() {
        return VERSION;
    });

    this.addCommand('quit', 'quit server', function() {
        process.exit(0);
    });

    this.registerModules();
    this.bindHttp();
    this.bindOsc();
}

inherits(Server, mod.Module);

function getHttp(res, path) {
    log.debug('URL request:', path);
    res.sendFile(path, {
        root: __dirname + '/../../build/'
    }, function(err) {
        if (err) {
            log.warn('file not exists:', path);
            res.status(err.status).send('Not found: ' + __dirname + path);
        }
    });
}

Server.prototype.modulePath = function(name) {
    return this.MODULE_ROUTES[name] + '.html';
}

Server.prototype.hasSync = function(url) {
    return this.sync_pages[url] !== undefined;
}

Server.prototype.registerModules = function() {
    var self = this;
    for (url in this.MODULE_ROUTES) {
        this.app_global.app.get(url, function(req, res) {
            var req_url = req['path'];
            var path = self.modulePath(req_url);
            // sync registered modules
            if (self.hasSync(req_url)) {
                self.oscClient().send("/sync" + req_url);
            }

            getHttp(res, path);
        });
    }
}

Server.prototype.bindHttp = function() {
    var app = this.app_global.app;

    // serve CSS files
    app.get('/css/*.css', function(req, res) {
        getHttp(res, req['path']);
    });

    app.get('/css/*', function(req, res) {
        getHttp(res, req['path']);
    });

    // serve JS lib files
    app.get('/js/*', function(req, res) {
        getHttp(res, req['path']);
    });

    // serve images files
    app.get('/img/*.jpg', function(req, res) {
        getHttp(res, req['path']);
    });

    app.get('/img/*.png', function(req, res) {
        getHttp(res, req['path']);
    });

    // serve WAV files
    app.get('/sound/*.wav', function(req, res) {
        getHttp(res, decodeURI(req['path']));
    });
}

Server.prototype.bindOsc = function() {
    var osc_server = this.app_global.osc.server;
    var io = this.app_global.io;

    this.oscServer().on("/guido/forward", function(msg, rinfo) {
        if (msg.length < 2) {
            log.error("forward:", "invalid argument count");
            return;
        }

        var path = msg[1];
        var args = msg.slice(2);
        log.verbose('master => client: %s %s', path, args.join(' '));
        io.emit(path, args);
    });
}

Server.prototype.bindSocket = function(socket) {
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
}

Server.prototype.notifyOnBoot = function() {
    this.oscClient().send(this.path(), 'boot');
}

Server.prototype.notifyOnQuit = function() {
    this.oscClient().send(this.path(), 'quit');
}

module.exports = Server;
