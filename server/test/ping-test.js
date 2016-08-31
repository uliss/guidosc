var chai = require('chai');
var sinon = require('sinon');
var expect = chai.expect; // we are using the "expect" style of Chai
var Ping = require('../src/ping.js');

var CONTEXT = {
    var osc_func_dict = {};

    io: {
        emit: function() {}
    },
    osc: {
        client: {
            send: function() {}
        },
        server: {
            on: function() {}
        }
    }
    put_osc: function(args) {
        var args = Array.prototype.slice.call(arguments, 0);
        this.server.on(args)
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
        // stub some console methods
        io_emit = sandbox.spy();
        osc_send = sandbox.spy();
        osc_on = sandbox.spy();
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

    it('command', function() {
        var fn;
        CONTEXT.osc.server.on = sandbox.spy(function(msg, func) {
            fn = func;
        });

        var m = new Ping(CONTEXT);

        expect(m.runCommand('ping', 123)).to.be.equal(123);
        // expect(fn(123)).to.be.equal(123);
        expect(osc_on.called).to.be.true;
    });
});
