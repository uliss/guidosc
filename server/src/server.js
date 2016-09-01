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

    this.registerModules();
    this.bindHttp();

    this.onOSC(this.path(), function() {
        this.notifyOnQuit();
        process.exit(0);
    });
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
                this.oscSendArray("/sync", [req_url]);
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

Server.prototype.notifyOnBoot = function() {
    this.oscSendArray(this.path(), ['boot']);
}

Server.prototype.notifyOnQuit = function() {
    this.oscSendArray(this.path(), ['quit']);
    this.socketSendArray(this.path(), ['quit']);
}

module.exports = Server;
module.exports._test = {
    log: log
};
