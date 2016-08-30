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

Module.prototype.broadcastPath = function() {
    return this.path() + "/broadcast";
};

Module.prototype.addCommand = function(name, help, func, opts) {
    if (!opts) opts = {};
    this.commands[name] = func;
    func.help_message = help;
    func.call_options = opts;
    func.command_path = this.path() + "/" + name;
};

Module.prototype.commandHelp = function(name) {
    return this.commands[name] ? this.commands[name].help_message : '';
};

Module.prototype.commandBroadcastType = function(name) {
    var cmd = this.commands[name];
    if (!cmd) return null;
    return cmd.call_options.broadcast ? cmd.call_options.broadcast : null;
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
            var pall = v.slice(1).split('=');
            var res = [pall[0]];
            if (pall.length > 1) res = res.concat(pall.slice(1).join('='));
            return res;
        })
        .reject(function(v) {
            return v[0] == '';
        })
        .each(function(opt) {
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
        try {
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
                // removed undefined
                var arg_list = [path, cmd, data].filter(function(n) {
                    return n != undefined;
                });

                // send back
                var opts = parseOscOptions(args);
                if (opts.back) {
                    var $this = self.app_global.osc.client;
                    $this.send.apply($this, arg_list);
                }
            });
        } catch (e) {
            log.error("registerOSCHandler exception:", e.message);
        }
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

function packCommandData(name, args, result) {
    var res = [name];

    if (args !== undefined) res = res.concat(args);

    if (result !== undefined) {
        if (Array.isArray(result)) {
            res.push(result);
        } else if (typeof result === 'object') {
            res.push([JSON.stringify(result)]);
        } else
            res.push([result]);
    } else {
        res.push([]);
    }

    return res;
}

Module.prototype.runCommand = function(name, args, callback) {
    var result = this.commands[name].call(this, args);
    // run socket callback
    if (callback) callback(result);

    var bc_type = this.commandBroadcastType(name);
    if (!bc_type)
        return result;

    var bc_arg_list = packCommandData(name, args, result);
    switch (this.commandBroadcastType(name)) {
        case 'osc':
            this.broadcastOsc.apply(this, bc_arg_list);
            break;
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
        try {
            var cmd = parseMsg(msg);
            if (!self.checkCommand(cmd.name)) return;
            self.runCommand(cmd.name, cmd.args, callback);
        } catch (e) {
            log.error("bindSocket exception:", e.message);
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

Module.prototype.socketSendArray = function(path, args) {
    if (!Array.isArray(args))
        throw new Error("socketSendArray: arguments must be an array");

    this.app_global.io.emit(path, args);
};

Module.prototype.oscSendArray = function(path, args) {
    if (typeof path !== 'string') {
        throw new Error("oscSendArray: path must be a string: %j", path);
    }

    if (!Array.isArray(args))
        throw new Error("oscSendArray: arguments must be an array");

    var arg_list = [path].concat(args);
    var obj = this.app_global.osc.client;
    obj.send.apply(obj, arg_list);
};

function toString(array) {
    return (array.length == 1) ? array : array.join(' ');
}

Module.prototype.broadcastSocket = function(msg) {
    var args = Array.prototype.slice.call(arguments, 0);
    var path = this.broadcastPath()
    log.debug("broadcastSocket: %s %s", path, toString(args), {});
    this.socketSendArray(path, args);
};

Module.prototype.broadcastOsc = function(msg) {
    var args = Array.prototype.slice.call(arguments, 0);
    var broadcast_path = this.path() + "/broadcast";
    log.debug("broadcastSocket:", "message: %s %s", broadcast_path, toString(args));
    this.oscSendArray(broadcast_path, args);
};

Module.prototype.broadcast = function(msg, type) {
    try {
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
    } catch (e) {
        log.error("broadcast exception:", e.what);
    }
}

module.exports.Module = Module;
// for testing
module.exports._test = {
    parseOscOptions: parseOscOptions,
    log: log,
    packCommandData: packCommandData
}
