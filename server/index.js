const url = require('url');
var fs = require('fs');
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var osc = require('node-osc');
var npid = require('npid');
var timer = require('./src/timer');
var utils = require('./src/utils');
var Server = require('./src/server');
var Ping = require('./src/ping');
var Manager = require('./src/manager');
var Client = require('./src/client.js');
var mod_ui = require('./src/ui');
var Sound = require('./src/sound.js');

const NODE_PORT = 3000;
const OSC_IN_PORT = 5000;
const OSC_OUT_PORT = OSC_IN_PORT + 1;
const PID_FILE = "/usr/local/var/run/guidosc.pid";
const SERVER_ROOT = __dirname + "/../build";

var log = utils.log();

var APP_GLOBAL = {};
APP_GLOBAL.http = http;
APP_GLOBAL.app = app;
APP_GLOBAL.io = io;

try {
    try {
        fs.accessSync(SERVER_ROOT, fs.F_OK);
    } catch (e) {
        log.error("root server direcoty is not exists: %s", SERVER_ROOT);
        log.error("did you you run 'gulp'?");
        process.exit(3);
    }

    // handle Ctrl+C terminate
    process.on('SIGINT', function() {
        process.exit(2);
    });

    var pid = npid.create(PID_FILE);
    pid.removeOnExit();

    var oscServer = new osc.Server(OSC_IN_PORT, '0.0.0.0');
    var oscClient = new osc.Client('127.0.0.1', OSC_OUT_PORT);

    APP_GLOBAL.osc = {};
    APP_GLOBAL.osc.server = oscServer;
    APP_GLOBAL.osc.client = oscClient;

    var server = new Server(APP_GLOBAL);
    // mod_ui.init(APP_GLOBAL);
    var client_manager = new Manager(APP_GLOBAL);
    var ping = new Ping(APP_GLOBAL);
    var timer = new timer.ServerTimer(APP_GLOBAL);
    var client = new Client(APP_GLOBAL);
    var sound = new Sound(APP_GLOBAL);

    io.on('connection', function(socket) {
        client_manager.bindClient(socket);
        server.bindSocket(socket);
        ping.bindSocket(socket);
        timer.bindSocket(socket);
        sound.bindSocket(socket);
        // mod_ui.bindSocket(APP_GLOBAL, socket);
        // sounds.bindSocket(io, socket);
    });

    http.listen(NODE_PORT, function() {
        log.info('GUIDOSC server started');
        log.info('listening HTTP on *:' + NODE_PORT);
        log.info('listening OSC on *:' + OSC_IN_PORT);
        log.info('sending OSC to localhost:' + OSC_OUT_PORT);
        server.notifyOnBoot();
    });
} catch (err) {
    log.error(err.message);
    process.exit(1);
}
