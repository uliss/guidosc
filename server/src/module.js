var util = require('util');
var sprintf = require("sprintf-js").sprintf;
var _ = require('underscore');
var utils = require('./utils.js');
var log = utils.log();

function Module(app_global, name) {
    this.app_global = app_global;
    this.name = name;
    this.commands = {};
    this.registerOSCHandler();
    this.addCommand('help', 'prints this help', function() {
        var msg = sprintf('HELP\nModule: "%s"\n', this.name);
        msg += "    supported commands are:\n";
        _.each(this.commands, function(func, name) {
            msg += sprintf("        %-8s - %s\n", "'" + name + "'", func.help_message);
        });

        // chop last "\n"
        log.info(msg.slice(0, -1));
    });
}

Module.prototype.path = function() {
    return "/guido/module/" + this.name;
};

Module.prototype.addCommand = function (name, help, func) {
    this.commands[name] = func;
    func.help_message = help;
};

Module.prototype.registerOSCHandler = function () {
    var path = this.path();
    var self = this;

    this.app_global.osc.server.on(path, function(msg) {
        log.debug(msg, {});

        var cmd = msg[1];
        if(!cmd) {
            log.error("No command given");
            log.error("Usage: '%s CMD [ARGS]'", path);
            log.error("Send: '%s help' to get full list", path);
            return;
        };

        if(!self.commands[cmd]) {
            log.error("Invalid command:", cmd);
            log.error("Send: '%s help' to get full list", path);
        }

        self.commands[cmd].call(self);
    });
};

Module.prototype.io = function() {
    return this.app_global.io;
};

Module.prototype.app = function() {
    return this.app_global.app;
};

Module.prototype.oscClient = function() {
    return this.app_global.osc.client;
};

Module.prototype.oscSend = function() {
    return this.app_global.osc.client.send(arguments);
};

Module.prototype.oscServer = function() {
    return this.app_global.osc.server;
};

Module.prototype.onOSC = function(path, func) {
    this.app_global.osc.server.on(path, func);
};

Module.prototype.sendOSC = function() {
    this.app_global.osc.client.send(arguments);
};

module.exports.Module = Module;
