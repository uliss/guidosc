var chai = require('chai');
var sinon = require('sinon');
var expect = chai.expect; // we are using the "expect" style of Chai
var Ping = require('../src/ping.js');
var CONTEXT = require('./context.js');

describe('PingTest', function() {
    var sandbox;
    var osc_send;

    beforeEach(function() {
        // create a sandbox
        sandbox = sinon.sandbox.create();
        CONTEXT.reset();
        CONTEXT.init(sandbox);
        osc_send = CONTEXT.osc.client.send;
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
        // valid path, valid command, no back
        CONTEXT.testOSC('/guido/module/ping', 'ping', 1);
        expect(osc_send.called).to.be.false;

        // valid path, valid command, :back option
        CONTEXT.testOSC(m.path(), 'ping', 1, ':back');
        expect(osc_send.called).to.be.true;
        expect(osc_send.lastCall.args).to.be.deep.equal([m.path(), 'ping', 1]);

        // valid path, valid command, :back option (only first argument)
        CONTEXT.testOSC(m.path(), 'ping', 20, 21, ':back');
        expect(osc_send.called).to.be.true;
        expect(osc_send.lastCall.args).to.be.deep.equal([m.path(), 'ping', 20]);
    });

    it('socket_command', function() {
        var m = new Ping(CONTEXT);
        var result;
        var fn = sandbox.spy(function(v) {
            result = v;
        });

        m.bindSocket(CONTEXT.socket);
        CONTEXT.socket.emit(m.path(), ['ping', 11], fn);
        expect(result).to.be.equal(11);

        CONTEXT.socket.emit(m.path(), ['ping', 120], fn);
        expect(result).to.be.equal(120);
    });
});
