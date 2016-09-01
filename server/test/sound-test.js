var fs = require('fs');
var chai = require('chai');
var sinon = require('sinon');
var expect = chai.expect;
var Sound = require('../src/sound.js');
var c = require('./common.js');
var SPY_CONTEXT = c.SPY_CONTEXT;
var SOCKET_RESULT = c.SOCKET_RESULT;

// disable logging
sinon.stub(Sound._test.log, "log");
var TMP_DIR = __dirname + '/tmp';

function mkdir() {
    fs.mkdirSync(TMP_DIR);
}

function mktmp(name) {
    fs.closeSync(fs.openSync(TMP_DIR + '/' + name, 'w'));
}

function rmdir() {
    fs.readdirSync(TMP_DIR).forEach(function(f) {
        fs.unlinkSync(TMP_DIR + '/' + f);
    });
    fs.rmdirSync(TMP_DIR);
}

describe('SoundTest', function() {
    var sandbox;
    var io_emit;

    beforeEach(function() {
        sandbox = sinon.sandbox.create();
        SPY_CONTEXT.reset();
        SPY_CONTEXT.init(sandbox);
        io_emit = SPY_CONTEXT.io.emit;
        mkdir();
    });

    afterEach(function() {
        sandbox.restore();
        rmdir();
    });

    it('new Sound', function() {
        var m = new Sound(SPY_CONTEXT);
        expect(m.name).to.equal('sound');

        m.bindSocket(SPY_CONTEXT.socket);
        SOCKET_RESULT.init();
        SOCKET_RESULT.emit(m.path(), "help");
        expect(SOCKET_RESULT.result).to.be.deep.equal(['help', 'ls', 'playlist']);
    });

    it('ls', function() {
        var m = new Sound(SPY_CONTEXT);
        m.soundDir = '/not-exists';
        expect(m.runCommand('ls')).to.be.deep.equal([]);

        m.soundDir = TMP_DIR;
        expect(m.runCommand('ls')).to.be.deep.equal([]);

        // test file:
        // only wav files
        mktmp('1.txt');
        expect(m.runCommand('ls')).to.be.deep.equal([]);

        mktmp('1.wav.txt');
        expect(m.runCommand('ls')).to.be.deep.equal([]);

        mktmp('2.wav');
        expect(m.runCommand('ls')).to.be.deep.equal(['2.wav']);

        mktmp('3.wav');
        expect(m.runCommand('ls')).to.be.deep.equal(['2.wav', '3.wav']);

        mktmp('1.wav');
        expect(m.runCommand('ls')).to.be.deep.equal(['1.wav', '2.wav', '3.wav']);

        rmdir();
        mkdir();
        mktmp('тест.wav.tmp.txt.wav');
        expect(m.runCommand('ls')).to.be.deep.equal(['тест.wav.tmp.txt.wav']);
    });

    it('playlist', function() {
        var m = new Sound(SPY_CONTEXT);
        m.soundDir = '/not-exists';
        expect(m.runCommand('playlist')).to.be.deep.equal([]);

        m.soundDir = TMP_DIR;
        // empty dir
        expect(m.runCommand('playlist')).to.be.deep.equal([]);
        mktmp('1.wav');
        expect(m.runCommand('playlist')[0]).to.have.property('title', '1');
        expect(m.runCommand('playlist')[0]).to.have.property('author', 'SuperCollider');
        expect(m.runCommand('playlist')[0]).to.have.property('url', '/sound/1.wav');
        expect(m.runCommand('playlist')[0]).to.have.property('pic', '/css/cover-default.png');

        // reverse order
        mktmp('2.wav');
        expect(m.runCommand('playlist')[0]).to.have.property('title', '2');
        expect(m.runCommand('playlist')[0]).to.have.property('url', '/sound/2.wav');
        // 1.wav
        expect(m.runCommand('playlist')[1]).to.have.property('title', '1');
    });
});
