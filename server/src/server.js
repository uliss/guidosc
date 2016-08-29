var utils = require('./utils');
var log = utils.log('server');
var mod = require('./module.js');
var inherits = require('inherits');

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

Server.prototype.registerModules = function() {
    var self = this;
    for (url in this.MODULE_ROUTES) {
        this.app().get(url, function(req, res) {
            var req_url = req['path'];
            var path = self.modulePath(req_url);
            // sync registered modules
            if (self.sync_dict[req_url] !== undefined) {
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

    // this.oscServer().on(node_path("/supercollider"), function(msg, rinfo) {
    //     log.verbose('=> client: %s', msg.slice(1));
    //     io.emit(cli_path("/supercollider"), msg.slice(1));
    // });
    //
    // this.oscServer().on(node_path("/forward"), function(msg, rinfo) {
    //     log.verbose('supercollider => client: %s %s', msg[1], msg.slice(2).join(' '));
    //     io.emit(msg[1], msg.slice(2));
    // });
    //
    // this.oscServer().on(node_path("/app/sync/add"), function(msg, rinfo) {
    //     addAutoSync(msg[1]);
    // });
    //
    // this.oscServer().on(node_path("/app/sync/remove"), function(msg, rinfo) {
    //     removeAutoSync(msg[1]);
    // });
    //
    // this.oscServer().on(node_path("/app/sync/print"), function(msg, rinfo) {
    //     printAutoSync();
    // });
}

function bindSocket(app_global, socket) {
    notifyOnClientConnect(app_global, socket);
    notifyOnClientDisconnect(app_global, socket);

    var osc_client = app_global.osc.client;

    socket.on(node_path("/supercollider"), function(msg) {
        log.verbose('=> supercollider: %s', msg);
        if (msg.length == 1) {
            osc_client.send(sc_path("/control"), msg[0]);
        }
        if (msg.length == 2) {
            osc_client.send(sc_path("/control"), msg[0], msg[1]);
        }
    });

    socket.on("/forward", function(msg) {
        switch (msg.length) {
            case 0:
                log.error("Invalid forward message format. Should be: DEST_PATH [ARGS]");
                break;
            case 1:
                log.verbose('client => supercollider:', msg[0]);
                osc_client.send(msg[0]);
            default:
                {
                    log.verbose('client => supercollider: %s %s', msg[0], msg.slice(1).join(' '));
                    osc_client.send(msg[0], msg.slice(1));
                }
        }
    });
}

Server.prototype.notifyOnBoot = function() {
    this.oscClient().send(this.path(), 'nodejs_boot');
}

function notifyOnClientConnect(app_global, socket) {
    var addr = socket.request.connection.remoteAddress.substring(7);
    if (!addr) addr = "127.0.0.1";
    log.info('connected:', addr);
    app_global.osc.client.send(sc_path("/control"), 'client_connect', addr);
}

function notifyOnClientDisconnect(app_global, socket) {
    var addr = socket.request.connection.remoteAddress.substring(7);
    if (!addr) addr = "127.0.0.1";

    socket.on('disconnect', function() {
        log.info('disconnected:', addr);
        app_global.osc.client.send(sc_path("/control"), 'client_disconnect', addr);
    });
}

module.exports.bindSocket = bindSocket;
module.exports.notifyOnClientConnect = notifyOnClientConnect;
module.exports.notifyOnClientDisconnect = notifyOnClientDisconnect

module.exports = Server;
