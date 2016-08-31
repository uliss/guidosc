var chai = require('chai');
var sinon = require('sinon');
var expect = chai.expect; // we are using the "expect" style of Chai
var Manager = require('../src/manager.js');
var CONTEXT = require('./context.js');

// disable logging
sinon.stub(Manager._test.log, "log");

describe('ManagerTest', function() {
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

    it('new Manager', function() {
        var m = new Manager(CONTEXT);
        expect(m).to.be.an('object');
        expect(m.name).to.equal('manager');
        expect(m.checkCommand('list')).to.be.true;
    });

    it('osc_command', function() {
        var m = new Manager(CONTEXT);
        // valid path, valid command, no back
        CONTEXT.testOSC(m.path(), 'list');
        expect(osc_send.called).to.be.false;

        // valid path, valid command, :back option
        CONTEXT.testOSC(m.path(), 'list', ':back');
        expect(osc_send.called).to.be.true;
        expect(osc_send.lastCall.args).to.be.deep.equal([m.path(), 'list', []]);
        osc_send.reset();

        // valid path, valid command, :back option (only first argument)
        m.clients['127.0.0.1'] = 1;
        CONTEXT.testOSC(m.path(), 'list', ':back');
        expect(osc_send.called).to.be.true;
        expect(osc_send.lastCall.args).to.be.deep.equal([m.path(), 'list', ['127.0.0.1']]);
    });

    it('bindClient', function() {
        var socket = {
            fn: {},
            disconnect: function() {
                this.fn['disconnect']();
            },
            on: function(name, cb) {
                // console.log(ip);
                this.fn[name] = cb;
            },
            request: {
                connection: {
                    remoteAddress: ""
                }
            }
        };

        var m = new Manager(CONTEXT);
        m.bindClient(socket);
        expect(osc_send.called).to.be.true;
        expect(osc_send.lastCall.args).to.be.deep.equal([m.path(), 'connected', '127.0.0.1']);
        osc_send.reset;

        CONTEXT.testOSC(m.path(), 'list', ':back');
        expect(osc_send.called).to.be.true;
        expect(osc_send.lastCall.args).to.be.deep.equal([m.path(), 'list', ['127.0.0.1']]);
        osc_send.reset;

        socket.request.connection.remoteAddress = "xxxxxxx10.0.0.1";
        m.bindClient(socket);
        expect(osc_send.called).to.be.true;
        expect(osc_send.lastCall.args).to.be.deep.equal([m.path(), 'connected', '10.0.0.1']);
        osc_send.reset;

        CONTEXT.testOSC(m.path(), 'list', ':back');
        expect(osc_send.called).to.be.true;
        expect(osc_send.lastCall.args).to.be.deep.equal([m.path(), 'list', ['127.0.0.1', '10.0.0.1']]);
        osc_send.reset;

        socket.disconnect('10.0.0.1');
        expect(osc_send.called).to.be.true;
        expect(osc_send.lastCall.args).to.be.deep.equal([m.path(), 'disconnected', '10.0.0.1']);
        osc_send.reset;

        CONTEXT.testOSC(m.path(), 'list', ':back');
        expect(osc_send.called).to.be.true;
        expect(osc_send.lastCall.args).to.be.deep.equal([m.path(), 'list', ['127.0.0.1']]);
        osc_send.reset;
    });
});
