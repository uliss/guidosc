var chai = require('chai');
var sinon = require('sinon');
var expect = chai.expect; // we are using the "expect" style of Chai
var Ping = require('../src/ping.js');
var t = require('../src/module.js')._test;

var CONTEXT = {
    io: {
        emit: function() {}
    },
    osc: {
        client: {
            send: function() {}
        },
        server: {
            fn_dict: {},
            testMsg: function(args) {
                var args = Array.prototype.slice.call(arguments, 0);
                var func = this.fn_dict[args[0]];
                if (func) {
                    // console.log(args);
                    func.call(null, args);
                }
            },
            on: function(path, func) {
                this.fn_dict[path] = func;
            },
            handler: function(name) {
                return this.fn_dict[name];
            }
        }
    },
    expect: {
        osc: {
            client: {
                send: {
                    args: function() {
                        var args = Array.prototype.slice.call(arguments, 0);
                        return expect(CONTEXT.osc.client.send.lastCall.args).to.be.deep.equal(args);
                    },
                    called: function() {
                        return expect(CONTEXT.osc.client.send.called);
                    },
                    reset: function() {
                        CONTEXT.osc.client.send.reset();
                    }
                },
            },
            server: {
                answer: function(path) {
                    return expect(CONTEXT.osc.server.handler(path).lastCall.args);
                }
            }
        }
    }
};

describe('PingTest', function() {
    var sandbox;
    var io_emit;
    var osc_send;
    var osc_on;

    beforeEach(function() {
        // create a sandbox
        sandbox = sinon.sandbox.create();
        sandbox.stub(t.log, "log");
        // stub some console methods
        io_emit = sandbox.spy();
        osc_send = sandbox.spy(CONTEXT.osc.server.send);
        osc_on = sandbox.spy(CONTEXT.osc.server.on);
        CONTEXT.osc_fn_dict = {};
        CONTEXT.io.emit = io_emit;
        CONTEXT.osc.client.send = osc_send;
        CONTEXT.osc.server.on = osc_on;
    });

    afterEach(function() {
        sandbox.restore();
    });

    it('new Ping', function() {
        var m = new Ping(CONTEXT);
        expect(m).to.be.an('object');
        expect(m.name).to.equal('ping');
        expect(m.checkCommand('ping')).to.be.true;
    });

    it('osc_command', function() {
        var m = new Ping(CONTEXT);
        // valid path, no command
        CONTEXT.osc.server.testMsg(m.path());
        CONTEXT.expect.osc.client.send.called().to.be.false;

        // valid path, invalid command
        CONTEXT.osc.server.testMsg(m.path(), 'hi!');
        CONTEXT.expect.osc.client.send.called().to.be.false;

        // valid path, valid command, no back
        CONTEXT.osc.server.testMsg('/guido/module/ping', 'help');
        CONTEXT.expect.osc.client.send.called().to.be.false;

        // valid path, valid command, no back
        CONTEXT.osc.server.testMsg('/guido/module/ping', 'help', ':back');
        CONTEXT.expect.osc.client.send.called().to.be.true;
        CONTEXT.expect.osc.client.send.args(m.path(), 'help', ['help', 'ping']);
        CONTEXT.expect.osc.client.send.reset();

        // valid path, valid command
        CONTEXT.osc.server.testMsg('/guido/module/ping', 'ping', 1, ':back');
        CONTEXT.expect.osc.client.send.called().to.be.true;
        CONTEXT.expect.osc.client.send.args(m.path(), 'ping', 1);
    });

    it('socket_command', function() {
        var m = new Ping(CONTEXT);
        // // valid path, no command
        // CONTEXT.osc.server.testMsg(m.path());
        // CONTEXT.expect.osc.client.send.called().to.be.false;
        //
        // // valid path, invalid command
        // CONTEXT.osc.server.testMsg(m.path(), 'hi!');
        // CONTEXT.expect.osc.client.send.called().to.be.false;
        //
        // // valid path, valid command, no back
        // CONTEXT.osc.server.testMsg('/guido/module/ping', 'help');
        // CONTEXT.expect.osc.client.send.called().to.be.false;
        //
        // // valid path, valid command, no back
        // CONTEXT.osc.server.testMsg('/guido/module/ping', 'help', ':back');
        // CONTEXT.expect.osc.client.send.called().to.be.true;
        // CONTEXT.expect.osc.client.send.args(m.path(), 'help', ['help', 'ping']);
        // CONTEXT.expect.osc.client.send.reset();
        //
        // // valid path, valid command
        // CONTEXT.osc.server.testMsg('/guido/module/ping', 'ping', 1, ':back');
        // CONTEXT.expect.osc.client.send.called().to.be.true;
        // CONTEXT.expect.osc.client.send.args(m.path(), 'ping', 1);
    });
});
