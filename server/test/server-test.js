var http = require('http');
var app = require('express')();
var http_server = http.Server(app);
var chai = require('chai');
var sinon = require('sinon');
var expect = chai.expect;
var Server = require('../src/server.js');
var c = require('./common.js');
var SPY_CONTEXT = c.SPY_CONTEXT;
var SOCKET_RESULT = c.SOCKET_RESULT;

// disable logging
sinon.stub(Server._test.log, "log");

function sockInit(m) {
    m.bindSocket(SPY_CONTEXT.socket);
    SOCKET_RESULT.init();
}

function sockWrite(m) {
    var path = m.path();
    var args = Array.prototype.slice.call(arguments, 1);
    if (args.length > 0)
        SOCKET_RESULT.emit.bind(SOCKET_RESULT, path).apply(SOCKET_RESULT, args);
    else
        SOCKET_RESULT.emit.bind(SOCKET_RESULT, path).call(SOCKET_RESULT);
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
    });

    afterEach(function() {
        sandbox.restore();
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

    it('sync', function() {
        var m = new Server(SPY_CONTEXT);
        sockInit(m);
        sockWrite(m, "sync_list");
        expect(sockValue()).to.be.deep.equal([]);
        expect(m.hasSync("/ui")).to.be.false;

        // null argument
        sockWrite(m, "sync_add");
        sockWrite(m, "sync_list");
        expect(sockValue()).to.be.deep.equal([]);

        sockWrite(m, "sync_add", "/ui");
        sockWrite(m, "sync_list");
        expect(sockValue()).to.be.deep.equal(["/ui"]);
        expect(m.hasSync("/ui")).to.be.true;

        sockWrite(m, "sync_add", "/not-exists");
        sockWrite(m, "sync_list");
        expect(sockValue()).to.be.deep.equal(["/ui"]);

        sockWrite(m, "sync_remove", "/ui");
        sockWrite(m, "sync_list");
        expect(sockValue()).to.be.deep.equal([]);
        expect(m.hasSync("/ui")).to.be.false;

        sockWrite(m, "sync_remove");
        sockWrite(m, "sync_remove", "/not-exists");
    });

    describe('http', function() {
        var self = this;
        this.server = null;

        before(function() {
            http_server.listen(8000);
            SPY_CONTEXT.app = app;
            this.server = new Server(SPY_CONTEXT);
            this.server.sync_pages['/ui'] = true;
        }.bind(this));

        after(function() {
            http_server.close();
        });

        it('should return 200', function(done) {
            http.get('http://localhost:8000/', function(res) {
                expect(res.statusCode).to.be.equal(200);
            });

            http.get('http://localhost:8000/ui', function(res) {
                expect(res.statusCode).to.be.equal(200);
            });

            http.get('http://localhost:8000/css/global.css', function(res) {
                expect(res.statusCode).to.be.equal(200);
            });

            http.get('http://localhost:8000/js/lib/bootstrap-slider.min.js', function(res) {
                expect(res.statusCode).to.be.equal(200);
            });

            done();
        });

        it('should return 404', function(done) {
            http.get('http://localhost:8000/not-found', function(res) {
                expect(res.statusCode).to.be.equal(404);
            });

            http.get('http://localhost:8000/css/not-exists.txt', function(res) {
                expect(res.statusCode).to.be.equal(404);
            });

            done();
        });

        it('should send sync', function(done) {
            http.get('http://localhost:8000/ui', function(res) {
                expect(res.statusCode).to.be.equal(200);
                expect(SPY_CONTEXT.osc.client.send.called).to.be.true;
                expect(SPY_CONTEXT.osc.client.send.lastCall.args).to.be.deep.equal(['/guido/sync/ui']);
                done();
            });
        });
    })
});
