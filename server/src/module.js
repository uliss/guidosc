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
        return Object.keys(this.commands);
    });
}

Module.prototype.path = function() {
    return "/guido/module/" + this.name;
};

Module.prototype.addCommand = function(name, help, func, opts) {
    if (!opts) opts = {};
    this.commands[name] = func;
    func.help_message = help;
    func.call_options = opts;
    func.command_path = this.path() + "/" + name;
};

function parseOscOptions(args) {
    if (!args) return {};
    if (args.length === 0) return {};

    var opts = {
        _raw_args: args
    };

    _.chain(args).reject(function(k) {
        return !(typeof k === 'string' || k instanceof String)
    }).reject(function(k) {
        return k[0] != ":"
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
        var args = msg.slice(2);
        if (!cmd) { // empty command
            log.error("No command given");
            log.error("Usage: '%s CMD [ARGS]'", path);
            log.error("Send: '%s help' to get full list", path);
            return;
        };

        if (!self.commands[cmd]) { // command not found in list
            log.error("Invalid command:", cmd);
            log.error("Send: '%s help' to get full list", path);
            return;
        }

        self.runCommand(cmd, args, function(data) {
            // send back
            var opts = parseOscOptions(args);
            if (opts.back)
                self.app_global.osc.client.send(path, cmd, data);
        });
    });
};

function parseMsg(msg) {
    var cmd, args;
    if (Array.isArray(msg)) {
        cmd = msg[0];
        args = msg.slice(1);
    } else if (typeof msg === "string") {
        cmd = msg;
        args = [];
    }

    if (cmd === undefined) {
        return null;
    }

    return {
        name: cmd,
        args: args
    };
}

Module.prototype.runCommand = function(name, args, callback) {
    var result = this.commands[name].call(this, args);
    // run socket callback
    if (callback) callback(result);

    var response = {
        cmd: name
    };

    if (args) response.args = args;
    if (result) response.value = result;

    var broadcast_type = this.commands[name].call_options.broadcast;
    if (broadcast_type) {
        this.broadcast(response, broadcast_type);
    }

    return result;
}

Module.prototype.checkCommand = function(name) {
    if (name === undefined) {
        log.error("empty command");
        return false;
    }

    if (this.commands[name] === undefined) {
        log.error("command not found:", name);
        return false;
    }

    return true;
};

Module.prototype.bindSocket = function(socket) {
    var path = this.path();
    var self = this;

    socket.on(path, function(msg, callback) {
        var cmd = parseMsg(msg);
        if (!self.checkCommand(cmd.name)) return;
        self.runCommand(cmd.name, cmd.args, callback);
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

Module.prototype.socketSendToAll = function(args) {
    log.debug("socketSendToAll: %s", args, {});
    this.io().emit(this.path(), args);
};

Module.prototype.socketSendToOthers = function(socket, args) {
    log.debug("socketSendToOthers: %s", args, {});
    socket.broadcast.emit(this.path(), args);
};

Module.prototype.sendToMaster = function() {
    var args = Array.prototype.slice.call(arguments, 0);
    args.unshift(this.path());
    log.debug("sendToMaster: %j", args, {});
    this.app_global.osc.client.send.apply(this.app_global.osc.client, args);
};

Module.prototype.broadcast = function(msg, type) {
    msg = JSON.stringify(msg);
    var broadcast_path = this.path() + "/broadcast";
    if (!type) type = 'all';
    switch (type) {
        case 'all':
            {
                this.app_global.io.emit(broadcast_path, msg);
                this.app_global.osc.client.send(broadcast_path, msg);
                log.debug("broadcast message: %s %s", broadcast_path, msg);
            }
            break;
        case 'socket':
            {
                this.app_global.io.emit(broadcast_path, msg);
                log.debug("broadcast message: %s %s", broadcast_path, msg);
            }
            break;
        default:
            log.error("unknown broadcast type:", type);
            break;
    }
}

module.exports.Module = Module;
