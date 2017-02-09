var osc = require('node-osc');
var argv = require('yargs')
    .usage('Usage: $0 [options]')
    .example('$0 -s 127.0.0.1 -s 1234 MESSAGE')
    .default('s', '127.0.0.1')
    .alias('s', 'server')
    .describe('s', 'destination OSC server')
    .default('p', 5000)
    .alias('p', 'port')
    .describe('p', 'destination OSC port')
    .help('h')
    .alias('h', 'help')
    .argv;

if (argv._.length < 1) {
    console.log("Error: no label specified. Try -h or --help options.");
    process.exit(2);
}

var LABEL = ['/vlabel/set', encodeURIComponent(argv._.join(' '))]

var client = new osc.Client(argv.s, argv.p);
client.send('/guido/forward', LABEL, function () {
    client.kill();
});
