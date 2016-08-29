var inherits = require('inherits');
var fsm = require('javascript-state-machine');
var jqw = require('./jqwidget.js');
var widget = require('./index.js');
var timer = require('../timer.js');
var utils = require('../utils.js');
var tmpl = require('fs').readFileSync(__dirname + '/tmpl/playcontrol.html', 'utf8');


function log() {
    utils.log('playcontrol.js', arguments);
}

function PlayControl(params) {
    var id = params.idx;
    jqw.JQueryWidget.call(this, "div", params);
    this.control = $(tmpl);

    this.display = this.control.find(".display");
    this.display_time = this.control.find(".display .time");
    this.display_part = this.control.find(".display .part");
    this.button_begin = this.control.find(".begin");
    this.button_prev = this.control.find(".prev");
    this.button_play = this.control.find(".play");
    this.button_pause = this.control.find(".pause");
    this.button_stop = this.control.find(".stop");
    this.button_next = this.control.find(".next");
    this.button_end = this.control.find(".end");
    this.position = "relative";

    this.control.appendTo(this.element);

    this.timer = new timer.PlayTimer(this.display_time);

    // create Finite State Machine
    this.fsm = fsm.StateMachine.create({
        initial: { state: 's_stop', event: 'init', defer: true },
        error: function(eventName, from, to, args, errorCode, errorMessage) {
            return 'event ' + eventName + ' was naughty :- ' + errorMessage;
        },
        events: [
            { name: 'startup', from: 'none',  to: 's_stop' },
            { name: 'stop',  from: 's_pause', to: 's_stop' },
            { name: 'stop',  from: 's_play',  to: 's_stop' },
            { name: 'play',  from: 's_stop',  to: 's_play' },
            { name: 'play',  from: 's_pause', to: 's_play' },
            { name: 'pause', from: 's_play',  to: 's_pause'  }
        ],
        callbacks: {
            oninit: function(event, from, to, msg) {
            },
            onplay:  function(event, from, to, send_flag) {
                var w = widget.find(id);
                var play = w.button_play;
                var stop = w.button_stop;
                var pause = w.button_pause;

                play.prop('disabled',  true);
                pause.prop('disabled', false);
                stop.prop('disabled',  false);

                play.removeClass('btn-success');
                pause.addClass('btn-warning');
                stop.addClass('btn-danger');

                play.addClass('btn-default');
                pause.removeClass('btn-default');
                stop.removeClass('btn-default');

                w.timer.start();
                if(send_flag === true) w.send("play");
            },
            onstop:  function(event, from, to, send_flag) {
                var w = widget.find(id);
                var play = w.button_play;
                var stop = w.button_stop;
                var pause = w.button_pause;

                play.prop('disabled',  false);
                pause.prop('disabled', true);
                stop.prop('disabled',  true);

                play.addClass('btn-success');
                pause.removeClass('btn-warning');
                stop.removeClass('btn-danger');

                play.removeClass('btn-default');
                pause.addClass('btn-default');
                stop.addClass('btn-default');

                w.timer.stop();
                if(send_flag === true) w.send("stop");
            },
            onpause:  function(event, from, to, send_flag) {
                var w = widget.find(id);
                var play = w.button_play;
                var stop = w.button_stop;
                var pause = w.button_pause;

                play.prop('disabled',  false);
                pause.prop('disabled', true);
                stop.prop('disabled',  false);

                play.addClass('btn-success');
                pause.addClass('btn-warning');
                stop.addClass('btn-danger');

                w.timer.pause();
                if(send_flag === true) w.send("pause");
            },
        }
    });

    this.button_play.click(function() { widget.find(id).play(true); });
    this.button_pause.click(function() { widget.find(id).pause(true); });
    this.button_stop.click(function() { widget.find(id).stop(true); });

    this.button_begin.click(function() { widget.find(id).send("first"); });
    this.button_prev.click(function() { widget.find(id).send("prev"); });
    this.button_next.click(function() { widget.find(id).send("next"); });
    this.button_end.click(function() { widget.find(id).send("last"); });

    if(!params.back) {
        this.button_begin.remove();
        this.button_prev.remove();
    }

    if(!params.forward) {
        this.button_next.remove();
        this.button_end.remove();
    }

    if(!params.display) {
        this.display.remove();
    }

    window.addEventListener('orientationchange', function() { widget.find(id).updatePosition(); });
    $(window).resize(function() { widget.find(id).updatePosition(); });

    this.fsm.init();
}

inherits(PlayControl, jqw.JQueryWidget);

PlayControl.prototype.updatePosition = function() {
    if(this.position == "absBottom") {
        this.control.css("position", "absolute");
        var x_off = ($(window).width() - this.control.width()) / 2;
        var y_off = $(window).height() - this.control.height();
        this.control.css("left", x_off);
        this.control.css("top", y_off);
    }

    if(this.position == "static") {
        this.control.css("position", "static");
    }
};

PlayControl.prototype.play = function(opts) { this.fsm.play(opts); };
PlayControl.prototype.pause = function(opts) { this.fsm.pause(opts); };
PlayControl.prototype.stop = function(opts) { this.fsm.stop(opts); };

PlayControl.prototype.command = function(cmd) {
    // log("command: " + JSON.stringify(cmd));
    // process "part" message
    if(cmd.part) { this.display_part.text(cmd.part); }

    // process "sync"
    if(cmd.sync) { this.timer.setTime(cmd.sync); }

    if(cmd.state) {
        switch(cmd.state) {
            case "play": this.play(false); break;
            case "stop": this.stop(false); break;
            case "pause": this.pause(false); break;
            default: log("unknown command:", cmd.state);
        }
    }

    if(cmd.position) {
        this.position = cmd.position;
        this.updatePosition();
    }
};

PlayControl.prototype.destroy = function() {
    this.fsm.stop();
    this.constructor.super_.prototype.destroy.apply(this);
};

function create(params) {
    var w = new PlayControl(params);
    return w;
}

module.exports.create = create;
