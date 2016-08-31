var chai = require('chai');
var sinon = require('sinon');
var expect = chai.expect; // we are using the "expect" style of Chai
var Manager = require('../src/manager.js');
var CONTEXT = require('./context.js');

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
});
