// var fs = require('fs');
var chai = require('chai');
var sinon = require('sinon');
var expect = chai.expect;
var Server = require('../src/server.js');
var c = require('./common.js');
var SPY_CONTEXT = c.SPY_CONTEXT;
var SOCKET_RESULT = c.SOCKET_RESULT;

// disable logging
sinon.stub(Server._test.log, "log");

// function mkdir() {
//     fs.mkdirSync(TMP_DIR);
// }
//
// function mktmp(name) {
//     fs.closeSync(fs.openSync(TMP_DIR + '/' + name, 'w'));
// }
//
// function rmdir() {
//     fs.readdirSync(TMP_DIR).forEach(function(f) {
//         fs.unlinkSync(TMP_DIR + '/' + f);
//     });
//     fs.rmdirSync(TMP_DIR);
// }

describe('ServerTest', function() {
    var sandbox;
    var io_emit;

    beforeEach(function() {
        sandbox = sinon.sandbox.create();
        SPY_CONTEXT.reset();
        SPY_CONTEXT.init(sandbox);
        // io_emit = SPY_CONTEXT.io.emit;
        // mkdir();
    });

    afterEach(function() {
        sandbox.restore();
        // rmdir();
    });

    it('new Server', function() {
        var m = new Server(SPY_CONTEXT);
        expect(m.name).to.equal('server');

        m.bindSocket(SPY_CONTEXT.socket);
        SOCKET_RESULT.init();
        SOCKET_RESULT.emit(m.path(), "help");
        expect(SOCKET_RESULT.result).to.be.deep.equal(["help",
            "pages",
            "sync_add",
            "sync_remove",
            "sync_list",
            "version",
            "quit"
        ]);
    });
});
