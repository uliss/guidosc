var winston = require("winston");
var winston_config = require('winston/lib/winston/config');

var options = {
    verbose: 1
};

function postmsg(msg, prefix = '[NodeJS]: ') {
    console.log(prefix + msg);
}

function postln(msg) {
    if (options['verbose'] != 0) {
        postmsg(msg);
    }
}

Number.prototype.toHHMMSS = function() {
    var seconds = Math.floor(this),
        hours = Math.floor(seconds / 3600);
    seconds -= hours * 3600;
    var minutes = Math.floor(seconds / 60);
    seconds -= minutes * 60;

    if (hours < 10) {
        hours = "0" + hours;
    }
    if (minutes < 10) {
        minutes = "0" + minutes;
    }
    if (seconds < 10) {
        seconds = "0" + seconds;
    }
    return hours + ':' + minutes + ':' + seconds;
};


function sc_path(path) {
    return "/sc" + path;
}

function node_path(path) {
    return "/node" + path;
}

function cli_path(path) {
    return "/cli" + path;
}

var logger_level = (process.env.DEBUG_LEVEL === undefined) ? 'debug' : process.env.DEBUG_LEVEL;

var logger = function(moduleName) {
    return new winston.Logger({
        transports: [
            new winston.transports.Console({
                level: logger_level,
                handleExceptions: true,
                json: false,
                colorize: true,
                label: moduleName,
                prettyPrint: true,
                handleExceptions: true,
                humanReadableUnhandledException: true,
                formatter: function(options) {
                    var output = '[NodeUI:';
                    output += winston_config.colorize(options.level, options.level) + '] ';
                    output += (options.label !== null) ? '(' + options.label + ') ' : ''
                    output += (undefined !== options.message ? options.message : '');
                    // output += (options.meta && Object.keys(options.meta).length) ? '\n';
                    output += (options.meta && Object.keys(options.meta).length && options.meta.stack) ? options.meta.stack.join("\n") : '';
                    return output;
                }
            })
        ]
    });
};

logger.exitOnError = false;

module.exports.postmsg = postmsg;
module.exports.postln = postln;
module.exports.sc_path = sc_path;
module.exports.node_path = node_path;
module.exports.cli_path = cli_path;
module.exports.log = logger;
