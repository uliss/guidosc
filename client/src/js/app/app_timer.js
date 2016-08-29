var fittext = require('fittext.js');
var server = require('../server.js');

Number.prototype.toHHMMSS = function() {
    var seconds = Math.floor(this),
        hours = Math.floor(seconds / 3600);
    seconds -= hours * 3600;
    var minutes = Math.floor(seconds / 60);
    seconds -= minutes * 60;

    if (hours < 10) {
        hours = "0" + hours;
    }
    if (minutes < 10) {
        minutes = "0" + minutes;
    }
    if (seconds < 10) {
        seconds = "0" + seconds;
    }
    return hours + ':' + minutes + ':' + seconds;
};

function timerControlSetStarted() {
    $("#timerStart")
        .removeClass("btn-info")
        .addClass("active")
        .addClass("btn-danger")
        .text("Stop")
        .attr("value", 1);
}

function timerControlSetStopped() {
    $("#timerStart")
        .addClass("btn-info")
        .removeClass("active")
        .removeClass("btn-danger")
        .text("Start")
        .attr("value", 0);
}

function TimerControl(timer) {
    this.start = $("#timerStart")
        .click(function() {
            if ($(this).attr("value") == 1) {
                timerControlSetStopped();
                timer.stop();
            } else {
                timerControlSetStarted();
                timer.start();
            }
        });

    $("#timerReset").click(function() {
        timer.reset();
    });
}

function ServerTimer(element) {
    this.socketPath = '/guido/module/timer';
    var n = 0;
    var self = this;

    server.socket.emit(this.socketPath, 'get', function(data) {
        element.text(data.toHHMMSS());
    });

    server.socket.emit(this.socketPath, 'state', function(state) {
        if (state)
            timerControlSetStarted();
        else
            timerControlSetStopped();
    });

    server.on(this.socketPath + "/broadcast", function(msg) {
        msg = JSON.parse(msg);
        if (msg.time !== undefined) {
            element.text(msg.time.toHHMMSS());
        }

        if (msg.cmd !== undefined) {
            switch (msg.cmd) {
                case 'start':
                    timerControlSetStarted();
                    break;
                case 'stop':
                    timerControlSetStopped();
                    break;
            }
        }
    });

    this.reset = function() {
        server.send(this.socketPath, 'reset');
    };

    this.start = function() {
        server.send(this.socketPath, 'start');
    };

    this.stop = function() {
        server.send(this.socketPath, 'stop');
    };
}

function ClientTimer(element) {
    this.currentTime = 0;
    this.timerId = null;
    this.element = element;
    this.socketPath = '/timer/client/control';
    server.send(this.socketPath, 'debug');

    var self = this;
    server.on('/client/timer', function(msg) {
        self.currentTime = msg;
        self.update();
    });


    this.start = function() {
        var self = this;
        this.timerId = setInterval(function() {
            self.next();
        }, 1000);

        server.send(this.socketPath, 'start');
    };

    this.stop = function() {
        clearInterval(this.timerId);
        server.send(this.socketPath, 'stop');
    };

    this.reset = function() {
        this.currentTime = 0;
        this.update();
        server.send(this.socketPath, 'reset');
    };

    this.update = function() {
        this.element.text(this.currentTime.toHHMMSS());
    };

    this.next = function() {
        this.currentTime++;
        this.update();
    };

    this.update();
}

function main() {
    $(document).ready(
        function() {
            var timer = new ServerTimer($("#timer_text"));
            var control = new TimerControl(timer);

            $("#timer_text").fitText(0.5);
        }
    );
}

module.exports.main = main;
module.exports.ClientTimer = ClientTimer;
module.exports.ServerTimer = ServerTimer;
module.exports.TimerControl = TimerControl;
