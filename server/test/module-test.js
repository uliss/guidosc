var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var osc = require('node-osc');

var chai = require('chai');
var expect = chai.expect; // we are using the "expect" style of Chai
var Module = require('../src/module.js').Module;
var t = require('../src/module.js')._test;

var CONTEXT = {};
CONTEXT.io = io;

var oscServer = new osc.Server(5020, '0.0.0.0');
var oscClient = new osc.Client('127.0.0.1', 5021);

CONTEXT.osc = {};
CONTEXT.osc.server = oscServer;
CONTEXT.osc.client = oscClient;

describe('ModuleTest', function() {
    it('new Module', function() {
        var m = new Module(CONTEXT, 'sample1');
        expect(m).to.be.an('object');
        expect(m.name).to.equal('sample1');
        expect(m.commands).to.be.not.empty;
        expect(m.commands).to.include.keys('help');
        expect(m.path()).to.equal('/guido/module/sample1');
        expect(m.broadcastPath()).to.equal('/guido/module/sample1/broadcast');
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
