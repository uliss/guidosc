var sinon = require('sinon');
var chai = require('chai');
var expect = chai.expect;
// var utils = require('./utils.js');
var t = require('../src/module.js')._test;

var CONTEXT = {
    io: {
        emit: function() {}
    },
    socket: {
        fn: null,
        on: function(path, fn) {
            this.fn = sinon.spy(fn);
        },
        emit: function(path, args, cb) {
            if (this.fn)
                this.fn.call(null, args, cb);
        }
    },
    osc: {
        client: {
            send: function() {}
        },
        server: {
            fn: {},
            testMsg: function(args) {
                var args = Array.prototype.slice.call(arguments, 0);
                var func = this.fn[args[0]];
                if (func) {
                    // console.log(args);
                    func.call(null, args);
                }
            },
            on: function(path, func) {
                this.fn[path] = sinon.spy(func);
            }
        }
    },
    expect: {
        // osc: {
        //     client: {
        //         send: {
        //             args: function() {
        //                 var args = Array.prototype.slice.call(arguments, 0);
        //                 return expect(CONTEXT.osc.client.send.lastCall.args).to.be.deep.equal(args);
        //             },
        //             called: function() {
        //                 return expect(CONTEXT.osc.client.send.called);
        //             },
        //             reset: function() {
        //                 CONTEXT.osc.client.send.reset();
        //             }
        //         },
        //     }
        // }
    },
    reset: function() {
        CONTEXT.osc.server.fn_dict = {};
        CONTEXT.socket.fn_dict = null;
        if (CONTEXT.socket.fn)
            CONTEXT.socket.fn.reset();
    },
    init: function(sandbox) {
        sandbox.stub(t.log, "log");
        // stub some console methods
        var io_emit = sandbox.spy(CONTEXT.io.emit);
        var osc_send = sandbox.spy(CONTEXT.osc.client.send);
        var osc_on = sandbox.spy(CONTEXT.osc.server.on);

        CONTEXT.io.emit = io_emit;
        CONTEXT.osc.client.send = osc_send;
        CONTEXT.osc.server.on = osc_on;
    },
    testOSC: function(args) {
        this.osc.server.testMsg.apply(this.osc.server, arguments)
    },
    testSocket: function(args) {
        this.osc.server.testMsg.apply(this.osc.server, arguments)
    }
};

var socket = {
    emit: function(args) {
        var args = Array.prototype.slice.call(arguments, 0);
        CONTEXT.socket.emit(args[0], args.slice(1), this.fn);
    },
    reset: function() {
        fn.reset();
    },
    init: function() {
        this.result = null;
        this.fn = sinon.spy(function(a) {
            socket.result = a;
        })
    }
};

module.exports.SPY_CONTEXT = CONTEXT;
module.exports.SOCKET_RESULT = socket;
