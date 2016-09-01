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


function sockInit(m) {
    m.bindSocket(SPY_CONTEXT.socket);
    SOCKET_RESULT.init();
}

function sockWrite(m, args) {
    var path = m.path();
    var args = Array.prototype.slice.call(arguments, 0);
    SOCKET_RESULT.emit.bind(SOCKET_RESULT, path)(args.slice(1));
}

function sockValue() {
    return SOCKET_RESULT.result;
}

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
        sockInit(m);
        expect(m.name).to.equal('server');

        sockWrite(m, "help");
        expect(SOCKET_RESULT.result).to.be.deep.equal(["help",
            "pages",
            "sync_add",
            "sync_remove",
            "sync_list",
            "version"
        ]);
    });

    it('version', function() {
        var m = new Server(SPY_CONTEXT);
        sockInit(m);
        sockWrite(m, "version");
        expect(sockValue()).to.be.equal("0.0.1");
    });

    it('pages', function() {
        var m = new Server(SPY_CONTEXT);
        sockInit(m);
        sockWrite(m, "pages");
        expect(sockValue()).to.be.deep.equal([
            "/speakers",
            "/info",
            "/vlabel",
            "/vmetro",
            "/concert",
            "/piece",
            "/ui",
            "/timer",
            "/tone",
            "/tests",
            "/utils",
            "/"
        ]);
    });

    it('quit', function() {
        sandbox.stub(process, 'exit');
        var m = new Server(SPY_CONTEXT);
        SPY_CONTEXT.testOSC(m.path(), 'quit');
        expect(process.exit.called).to.be.true;
        expect(process.exit.lastCall.args).to.be.deep.equal([0]);
        expect(SPY_CONTEXT.osc.client.send.called).to.be.true;
        expect(SPY_CONTEXT.io.emit.called).to.be.true;
    });
});
