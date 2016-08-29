var utils = require('./utils');
var node_path = utils.node_path;
var cli_path = utils.cli_path;
var sc_path = utils.sc_path;
var log = utils.log();

var sync_dict = {};

function addAutoSync(path) { sync_dict[path] = true; }
function removeAutoSync(path) { delete sync_dict[path]; }
function printAutoSync() { console.log(JSON.stringify(sync_dict, null, 2)); }

// URL -> server path (without '.html' extension)
const MODULE_ROUTES = {
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

function getHttp(res, path) {
    log.debug('URL request:', path);
    res.sendFile(path, {
        root: __dirname + '/../build/'
    }, function(err) {
        if (err) {
            log.warn('file not exists:', path);
            res.status(err.status).end();
        }
    });
}

function registerModules(app_global) {
    for (url in MODULE_ROUTES) {
        app_global.app.get(url, function(req, res) {
            var req_url = req['path'];
            var path = MODULE_ROUTES[req_url] + '.html';
            // sync registered modules
            if (sync_dict[req_url] !== undefined) {
                var osc_path = sc_path("/app/sync") + req_url;
                app_global.osc.client.send(osc_path);
            }

            getHttp(res, path);
        });
    }
}

function init(app_global) {
    bindHttp(app_global);
    bindOsc(app_global);
    process.env.PATH = process.env.PATH + ":/usr/local/bin";
}

function bindHttp(app_global) {
    registerModules(app_global);
    var app = app_global.app;

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

function bindOsc(app_global) {
    var osc_server = app_global.osc.server;
    var io = app_global.io;

    osc_server.on(node_path("/help"), function(msg, rinfo) {
        console.log("Available commands:\n    ");
        console.log([
            "echo",
            "help",
            "css",
            "redirect",
            "reload",
            "title",
            "alert"
        ].sort().map(function(v) {
            return node_path("/" + v)
        }).join("\n    "));
    });

    osc_server.on(node_path("/echo"), function(msg, rinfo) {
        console.log(msg[1]);
    });

    osc_server.on(node_path("/css"), function(msg, rinfo) {
        log.verbose('set css: %s { %s: %s }', msg[1], msg[2], msg[3]);
        io.emit(cli_path("/css"), [msg[1], msg[2], msg[3]]);
    });

    osc_server.on(node_path("/redirect"), function(msg, rinfo) {
        log.verbose('redirect to:', msg[1]);
        io.emit(cli_path("/redirect"), msg[1]);
    });

    osc_server.on(node_path("/reload"), function(msg, rinfo) {
        log.verbose('reloading page...');
        io.emit(cli_path("/reload"), msg[1]);
    });

    osc_server.on(node_path("/title"), function(msg, rinfo) {
        log.verbose('set title:', msg[1]);
        io.emit(cli_path("/title"), msg[1]);
    });

    osc_server.on(node_path("/alert"), function(msg, rinfo) {
        log.verbose('%s message: [%s] - %s', msg[1], msg[2], msg[3]);
        io.emit(cli_path("/alert"), {
            'type': msg[1],
            'title': msg[2],
            'text': msg[3]
        });
    });

    osc_server.on(node_path("/supercollider"), function(msg, rinfo) {
        log.verbose('=> client: %s', msg.slice(1));
        io.emit(cli_path("/supercollider"), msg.slice(1));
    });

    osc_server.on(node_path("/forward"), function(msg, rinfo) {
        log.verbose('supercollider => client: %s %s', msg[1], msg.slice(2).join(' '));
        io.emit(msg[1], msg.slice(2));
    });

    osc_server.on(node_path("/app/sync/add"), function(msg, rinfo) {
        addAutoSync(msg[1]);
    });

    osc_server.on(node_path("/app/sync/remove"), function(msg, rinfo) {
        removeAutoSync(msg[1]);
    });

    osc_server.on(node_path("/app/sync/print"), function(msg, rinfo) {
        printAutoSync();
    });
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

function notifyOnBoot(app_global) {
    app_global.osc.client.send(sc_path("/control"), 'nodejs_boot');
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

module.exports.init = init;
module.exports.bindSocket = bindSocket;
module.exports.notifyOnBoot = notifyOnBoot;
module.exports.notifyOnClientConnect = notifyOnClientConnect;
module.exports.notifyOnClientDisconnect = notifyOnClientDisconnect
