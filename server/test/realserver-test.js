var chai = require('chai');
var expect = chai.expect;
process.setMaxListeners(0);
var server = require('../index.js');
var io = require('socket.io-client');
var osc = require('node-osc');
var sinon = require('sinon');
var OSC_PORT = 9876;
var osc_server;

var client;
var options = {
    transports: ['websocket'],
    'force new connection': true
};

describe('real connection tests', function() {
    before(function() {
        osc_server = new osc.Server(OSC_PORT, '0.0.0.0');
        server.start(OSC_PORT);
    });

    after(function() {
        server.stop();
        osc_server.kill();
    });

    describe('Socket.IO tests', function() {
        beforeEach(function() {
            client = io.connect("http://localhost:3000", options);
        });

        afterEach(function() {
            if (client)
                client.disconnect();
        });

        it("help message", function(done) {
            client.once("connect", function() {
                client.emit("/guido/module/ping", "help", function(data) {
                    expect(data).to.be.deep.equal(['help', 'ping']);
                    done();
                });
            });
        });

        it("ping", function(done) {
            client.once("connect", function() {
                client.emit("/guido/module/ping", ["ping", 1001], function(data) {
                    expect(data).to.be.deep.equal(1001);
                    done();
                });
            });
        });

        it("connected clients", function(done) {
            client.once("connect", function() {
                client.emit("/guido/module/manager", "list", function(data) {
                    expect(data).to.be.deep.equal(['127.0.0.1']);
                    done();
                });
            });
        });

        it("disconnect test", function(done) {
            var call_count
            var cb = sinon.spy(function(msg) {
                if (cb.callCount == 2) {
                    expect(cb.calledWith(['/guido/module/manager', 'connected', '127.0.0.1'])).to.be.true;
                    expect(cb.calledWith(['/guido/module/manager', 'disconnected', '127.0.0.1'])).to.be.true;
                    done();
                }
            });

            osc_server.on("/guido/module/manager", cb);

            client.once("connect", function() {
                client.disconnect();
                client = null;
            });
        });

        describe('forward tests', function() {
            it("forward ok", function(done) {
                client.once("connect", function() {
                    client.emit("/guido/forward", ["/url", "arg1", "arg2"]);
                });

                osc_server.once("/url", function(msg) {
                    expect(msg).to.be.deep.equal(["/url", "arg1", "arg2"]);
                    done();
                });
            });

            it("forward url only", function(done) {
                client.once("connect", function() {
                    client.emit("/guido/forward", "/url");
                });

                osc_server.once("/url", function(msg) {
                    expect(msg).to.be.deep.equal(["/url"]);
                    done();
                });
            });

            it("forward error", function(done) {
                client.once("connect", function() {
                    client.emit("/guido/forward", [], function(err) {
                        console.log(err);
                        done();
                    });
                });
            });
        });
    });
});
