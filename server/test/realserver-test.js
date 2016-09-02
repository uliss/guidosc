var chai = require('chai');
var expect = chai.expect;
// var server = require('../index.js');
// var io = require('socket.io-client');
// var osc = require('node-osc');
// var sinon = require('sinon');
// var osc_server = new osc.Server(5001, '0.0.0.0');
//
// var client;
// var options = {
//     transports: ['websocket'],
//     'force new connection': true
// };

xdescribe('real connection tests', function() {
    before(function() {
        server.start();
    });

    after(function() {
        server.stop();
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
    });
});
