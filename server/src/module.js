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

Module.prototype.addCommand = function(name, help, func) {
    this.commands[name] = func;
    func.help_message = help;
};

function parseOscOptions(args) {
    if (!args) return {};
    if (args.length === 0) return {};

    var opts = {
        _raw_args: args
    };

    _.chain(args).reject(args, function(k) {
        k[0] != ":"
    }).map(function(v) {
        return v.slice(1).split('=', 2);
    }).each(function(opt) {
        if (opt.length < 2) {
            opts[opt[0]] = true;
            return;
        }
        opts[opt[0]] = opt[1];
    });

    return opts;
};

Module.prototype.registerOSCHandler = function() {
    var path = this.path();
    var self = this;

    this.app_global.osc.server.on(path, function(msg) {
        var cmd = msg[1];
        if (!cmd) { // empty command
            log.error("No command given");
            log.error("Usage: '%s CMD [ARGS]'", path);
            log.error("Send: '%s help' to get full list", path);
            return;
        };

        if (!self.commands[cmd]) { // command not found in list
            log.error("Invalid command:", cmd);
            log.error("Send: '%s help' to get full list", path);
        }

        var opts = parseOscOptions(msg.slice(2));
        log.debug("COMMAND: '%s'", cmd);

        if (!_.isEmpty(opts)) {
            log.debug(" with options: %j", opts, {});
        }

        var result = self.commands[cmd].call(self, opts);
        if (result) {
            if (opts.back) {
                self.sendToMaster(result);
            } else {
                log.debug(result, {});
            }
        }
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

Module.prototype.oscServer = function() {
    return this.app_global.osc.server;
};

Module.prototype.onOSC = function(path, func) {
    this.app_global.osc.server.on(path, func);
};

Module.prototype.sendOSC = function() {
    this.app_global.osc.client.send.apply(this.app_global.osc.client, arguments);
};

Module.prototype.sendToMaster = function() {
    var args = Array.prototype.slice.call(arguments, 0);
    args.unshift(this.path());
    log.debug("sendToMaster: %j", args, {});
    this.app_global.osc.client.send.apply(this.app_global.osc.client, args);
};

module.exports.Module = Module;
