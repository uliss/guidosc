var chai = require('chai');
var sinon = require('sinon');
var expect = chai.expect; // we are using the "expect" style of Chai
var Client = require('../src/client.js');
var CONTEXT = require('./context.js');

// disable logging
sinon.stub(Client._test.log, "log");

var socket = {
    emit: function(args) {
        var args = Array.prototype.slice.call(arguments, 0);
        CONTEXT.socket.emit(args[0], args.slice(1), this.fn);
    },
    reset: function() {
        fn.reset();
    },
    init: function() {
        this.result = null;
        this.fn = sinon.spy(function(a) {
            socket.result = a;
        })
    }
};

describe('ClientTest', function() {
    var sandbox;
    var io_emit;

    beforeEach(function() {
        sandbox = sinon.sandbox.create();
        CONTEXT.reset();
        CONTEXT.init(sandbox);
        io_emit = CONTEXT.io.emit;
    });

    afterEach(function() {
        sandbox.restore();
    });

    it('new Client', function() {
        var m = new Client(CONTEXT);
        expect(m).to.be.an('object');
        expect(m.name).to.equal('client');

        m.bindSocket(CONTEXT.socket);

        socket.init();
        socket.emit(m.path(), "help");
        expect(socket.result).to.be.deep.equal(['help', 'css', 'reload', 'redirect', 'title', 'alert']);
    });

    it('reload', function() {
        var m = new Client(CONTEXT);
        m.runCommand('reload');
        expect(io_emit.called).to.be.true;
        expect(io_emit.lastCall.args).to.be.deep.equal(['/guido/module/client/broadcast', ['reload']]);
    });

    it('redirect', function() {
        var m = new Client(CONTEXT);
        // no argument
        m.runCommand('redirect');
        expect(io_emit.called).to.be.false;

        // empty argument
        m.runCommand('redirect', []);
        expect(io_emit.called).to.be.false;

        m.runCommand('redirect', ['http://ya.ru']);
        expect(io_emit.lastCall.args).to.be.deep.equal([m.broadcastPath(), ['redirect', 'http://ya.ru']]);
    });

    it('redirect', function() {
        var m = new Client(CONTEXT);
        // no argument
        m.runCommand('title');
        expect(io_emit.called).to.be.false;

        // empty argument
        m.runCommand('title', []);
        expect(io_emit.called).to.be.false;

        m.runCommand('title', ['TITLE']);
        expect(io_emit.lastCall.args).to.be.deep.equal([m.broadcastPath(), ['title', 'TITLE']]);

        m.runCommand('title', ['TITLE1', 'TITLE2']);
        expect(io_emit.lastCall.args).to.be.deep.equal([m.broadcastPath(), ['title', 'TITLE1', 'TITLE2']]);
    });
});
