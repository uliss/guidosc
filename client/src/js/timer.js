var server = require('./server.js');

Number.prototype.toHHMMSS = function () {
    var seconds = Math.floor(this),
    hours = Math.floor(seconds / 3600);
    seconds -= hours*3600;
    var minutes = Math.floor(seconds / 60);
    seconds -= minutes*60;

    if (hours   < 10) {hours   = "0"+hours;}
    if (minutes < 10) {minutes = "0"+minutes;}
    if (seconds < 10) {seconds = "0"+seconds;}
    return hours+':'+minutes+':'+seconds;
};

function ServerTimer(element) {
    this.socketPath = '/timer/server/control';
    this.currentTime = 0;
    this.onStart = function(){};
    this.onStop = function() {};

    element.text(this.currentTime. toHHMMSS());
    server.send(this.socketPath, 'get');

    var self = this;

    server.on(this.socketPath, function(msg){
        console.log(msg);
        switch(msg) {
            case 'start':
            self.onStart();
            break;
            case 'stop':
            self.onStop();
            break;
        }
    });

    server.on('/server/timer', function(msg) {
        element.text(msg .toHHMMSS());
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
        this.timerId = setInterval(function(){
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
        this.element.text(this.currentTime .toHHMMSS());
    };

    this.next = function() {
        this.currentTime++;
        this.update();
    };

    this.update();
}

function PlaycontrolTimer(element) {
    this.currentTime = 0;
    this.timerId = null;
    this.element = element;
    this.isRunning = false;

    this.start = function() {
        this.isRunning = true;
        var self = this;
        this.timerId = setInterval(function(){
            self.next();
        }, 1000);
    };

    this.pause = function() {
        this.isRunning = false;
        clearInterval(this.timerId);
    };

    this.stop = function() {
        this.isRunning = false;
        clearInterval(this.timerId);
        this.reset();
    };

    this.reset = function() {
        this.currentTime = 0;
        this.update();
    };

    this.update = function() {
        this.element.text(this.currentTime .toHHMMSS());
    };

    this.next = function() {
        this.currentTime++;
        this.update();
    };

    this.setTime = function(tm) {
        this.currentTime = tm;
        if(this.isRunning) {
            this.pause();
            this.start();
        }
        this.update();
    };

    this.update();
}

module.exports.ServerTimer = ServerTimer;
module.exports.ClientTimer = ClientTimer;
module.exports.PlayTimer = PlaycontrolTimer;
