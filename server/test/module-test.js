var app = require('express')();
var http = require('http').Server(app);

var chai = require('chai');
var sinon = require('sinon');
var expect = chai.expect; // we are using the "expect" style of Chai
var Module = require('../src/module.js').Module;
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
            on: function() {}
        }
    }
};

describe('ModuleTest', function() {

    var sandbox;
    var io_emit;
    var osc_send;
    var osc_on;

    beforeEach(function() {
        // create a sandbox
        sandbox = sinon.sandbox.create();
        // stub some console methods
        sandbox.stub(t.log, "log");
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

    it('new Module', function() {
        var m = new Module(CONTEXT, 'sample1');
        expect(m).to.be.an('object');
        expect(m.name).to.equal('sample1');
        expect(m.commands).to.be.not.empty;
        expect(m.commands).to.include.keys('help');
        expect(m.path()).to.equal('/guido/module/sample1');
        expect(m.broadcastPath()).to.equal('/guido/module/sample1/broadcast');
        expect(m.runCommand('help')).to.deep.equal(['help']);
    });

    it('addCommand', function() {
        var m = new Module(CONTEXT, 'sample2');
        m.addCommand('test', 'sample command', function(msg) {
            return msg;
        });

        expect(m.commands).to.include.keys('test');
        expect(m.commands['test']).to.be.a('function');
        expect(m.commandHelp('test')).to.be.equal('sample command');
    });

    it('checkCommand', function() {
        var m = new Module(CONTEXT, 'sample3');
        expect(m.checkCommand('help')).to.be.ok;
        expect(m.checkCommand('')).to.be.false;
        expect(m.checkCommand('not-exists')).to.be.false;
    });

    it('onOSC', function() {
        var m = new Module(CONTEXT, 'sample1');
        m.onOSC('path', function() {});
        expect(osc_on.called).to.be.true;
        expect(osc_on.lastCall.calledWith('path')).to.be.true;
    });

    it('socketSendArray', function() {
        var m = new Module(CONTEXT, 'sample1');
        m.socketSendArray('path', [123]);
        expect(io_emit.called).to.be.true;
        expect(io_emit.lastCall.calledWith('path', [123])).to.be.true;

        var fn = function() { m.socketSendArray('path', 123); };
        expect(fn).to.throw(Error);
    });

    it('oscSendArray', function() {
        var m = new Module(CONTEXT, 'sample1');
        var fn = function() { m.socketSendArray('path', 123); };
        expect(fn).to.throw(Error);
        fn = function() { m.socketSendArray('path'); };
        expect(fn).to.throw(Error);

        m.oscSendArray("/path", [1]);
        expect(osc_send.called).to.be.true;
        expect(osc_send.lastCall.args).to.be.deep.equal(["/path", 1]);

        m.oscSendArray("/path", []);
        expect(osc_send.lastCall.args).to.be.deep.equal(["/path"]);

        m.oscSendArray("/path", [1,2,3]);
        expect(osc_send.lastCall.args).to.be.deep.equal(["/path",1,2,3]);
    });

    it('broadcastSocket', function() {
        var m = new Module(CONTEXT, 't1');

        m.broadcastSocket();
        expect(io_emit.called).to.be.true;
        expect(io_emit.lastCall.args).to.be.deep.equal(["/guido/module/t1/broadcast", []]);

        m.broadcastSocket(1);
        expect(io_emit.lastCall.args).to.be.deep.equal(["/guido/module/t1/broadcast", [1]]);

        m.broadcastSocket(1, 2, [3, 4]);
        expect(io_emit.lastCall.args).to.be.deep.equal(["/guido/module/t1/broadcast", [1, 2, [3, 4]]]);
    });

    it('broadcastOsc', function() {
        var m = new Module(CONTEXT, 't1');

        m.broadcastOsc();
        expect(osc_send.called).to.be.true;
        expect(osc_send.lastCall.args).to.be.deep.equal(["/guido/module/t1/broadcast"]);

        m.broadcastOsc(1);
        expect(osc_send.lastCall.args).to.be.deep.equal(["/guido/module/t1/broadcast", 1]);

        m.broadcastOsc(1, 2, [3, 4]);
        expect(osc_send.lastCall.args).to.be.deep.equal(["/guido/module/t1/broadcast", 1, 2, [3, 4]]);
    });

    it('commandBroadcastType', function() {
        var m = new Module(CONTEXT, 't1');
        m.addCommand('test', '', function(){}, {broadcast: 'all'});
        expect(m.commandBroadcastType('help')).to.be.null;
        expect(m.commandBroadcastType('not-exists')).to.be.null;
        expect(m.commandBroadcastType('test')).to.be.equal('all');
    });

    it('commandHelp', function() {
        var m = new Module(CONTEXT, 't1');
        expect(m.commandHelp('help')).to.be.equal('prints this help');
        expect(m.commandHelp('not-exists')).to.be.equal('');
    });

    it('runCommand', function() {
        var m = new Module(CONTEXT, 't1');
        var cmd = sandbox.spy();
        var cmd2 = sandbox.spy(function(msg) {return msg;});
        // var cmd
        var cb = sandbox.spy();
        m.addCommand('test', '', cmd);
        m.addCommand('test2', '', cmd2);

        m.runCommand('test');
        expect(cmd.called).to.be.true;
        expect(cmd.lastCall.args).to.be.deep.equal([undefined]);
        expect(cmd.lastCall.returnValue).to.be.undefined;

        m.runCommand('test', 123);
        expect(cmd.lastCall.args).to.be.deep.equal([123]);

        m.runCommand('test', [123, 234]);
        expect(cmd.lastCall.args).to.be.deep.equal([[123, 234]]);

        m.runCommand('test', 1, cb);
        expect(cmd.lastCall.args).to.be.deep.equal([1]);
        expect(cmd.lastCall.returnValue).to.be.undefined;
        // callback with undefined
        expect(cb.called).to.be.true;
        expect(cb.lastCall.args).to.be.deep.equal([undefined]);

        m.runCommand('test2', 1000, cb);
        expect(cmd2.lastCall.args).to.be.deep.equal([1000]);
        expect(cmd2.lastCall.returnValue).to.be.equal(1000);
        // callback with 1000
        expect(cb.called).to.be.true;
        expect(cb.lastCall.args).to.be.deep.equal([1000]);
    });

    it('packCommandData', function() {
        expect(t.packCommandData("test")).to.be.deep.equal(['test', []]);
        expect(t.packCommandData("test", 1)).to.be.deep.equal(['test', 1, []]);
        expect(t.packCommandData("test", [1])).to.be.deep.equal(['test', 1, []]);
        expect(t.packCommandData("test", [1,2])).to.be.deep.equal(['test', 1, 2, []]);
        expect(t.packCommandData("test", [1,2,3])).to.be.deep.equal(['test', 1, 2, 3, []]);
        expect(t.packCommandData("test", undefined, 1)).to.be.deep.equal(['test', [1]]);
        expect(t.packCommandData("test", undefined, 'a')).to.be.deep.equal(['test', ['a']]);
        expect(t.packCommandData("test", undefined, ['a', 'b'])).to.be.deep.equal(['test', ['a', 'b']]);
        expect(t.packCommandData("test", undefined, {k: 1})).to.be.deep.equal(['test', [JSON.stringify({k:1})]]);
        expect(t.packCommandData("test", 1, ['a', 'b'])).to.be.deep.equal(['test', 1, ['a', 'b']]);
        expect(t.packCommandData("test", [1, 2], ['a', 'b'])).to.be.deep.equal(['test', 1, 2, ['a', 'b']]);
        expect(t.packCommandData("test", 1, {k: 1})).to.be.deep.equal(['test', 1, [JSON.stringify({k:1})]]);
    });

    it('runCommand:broadcast', function() {
        var m = new Module(CONTEXT, 't1');
        var cmd = sandbox.spy(function(msg) {return msg;});

        m.addCommand('test', '', cmd, { broadcast: 'osc' });

        expect(m.runCommand('test')).to.be.undefined;
        expect(osc_send.called).to.be.true;
        expect(osc_send.lastCall.args).to.be.deep.equal([m.broadcastPath(), 'test', []]);

        expect(m.runCommand('test', 1)).to.be.equal(1);
        expect(osc_send.lastCall.args).to.be.deep.equal([m.broadcastPath(), 'test', 1, [1]]);
        expect(m.runCommand('test', [1, 2])).to.be.deep.equal([1,2]);
        expect(osc_send.lastCall.args).to.be.deep.equal([m.broadcastPath(), 'test', 1, 2, [1, 2]]);
    });

    it('parseOscOptions', function() {
        var p;
        expect(t.parseOscOptions()).to.be.empty;
        expect(t.parseOscOptions()).to.be.a('object');

        expect(t.parseOscOptions([])).to.be.empty;
        expect(t.parseOscOptions([])).to.be.a('object');

        expect(t.parseOscOptions(123)).to.not.empty;
        expect(t.parseOscOptions(123)).to.be.a('object');
        expect(t.parseOscOptions(123)._raw_args).to.be.equal(123);

        expect(t.parseOscOptions("string")).to.not.empty;
        expect(t.parseOscOptions("string")).to.be.a('object');
        expect(t.parseOscOptions("string")._raw_args).to.be.equal("string");

        expect(t.parseOscOptions(":arg")).to.not.empty;
        expect(t.parseOscOptions(":arg")).to.be.a('object');
        expect(t.parseOscOptions(":arg").arg).to.undefined;

        p = [":arg1", "123", 45, ":arg2", 23];
        expect(t.parseOscOptions(p).arg1).to.be.true;
        expect(t.parseOscOptions(p).arg2).to.be.true;

        p = t.parseOscOptions([":arg1=value", "123", 45, ":arg2=", ":arg3=23"]);
        expect(p.arg1).to.be.equal("value");
        expect(p.arg2).to.be.empty;
        expect(p.arg2).to.be.equal('');
        expect(p.arg2).to.be.a('string');
        expect(p.arg3).to.be.a('string');
        expect(p.arg3).to.be.equal("23");

        p = t.parseOscOptions([":arg1:=tetew=test"]);
        expect(p['arg1:']).to.be.equal("tetew=test");

        p = t.parseOscOptions([":="]);
        expect(p).to.be.not.empty;
        expect(p._raw_args[0]).to.be.equal(':=');
    });
});
