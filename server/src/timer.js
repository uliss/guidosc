var log = require('./utils').log;

function httpGet(req, res) {
    res.sendFile('timer.html', {
        root: __dirname + '/../build/'
    });
}

function ServerTimer(io, socket_path) {
    this.io = io;
    this.socketPath = socket_path;
    this.currentTime = 0;
    this.timerId = null;
    this.controlPath = '/timer/server/control';
}

ServerTimer.prototype.isRunning = function() {
    return this.timerId != null;
}

ServerTimer.prototype.update = function() {
    log.debug('ServerTimer:', this.currentTime.toHHMMSS());
    this.io.emit(this.socketPath, this.currentTime);
}

ServerTimer.prototype.emitControl = function(msg) {
    this.io.emit(this.controlPath, msg);
}

ServerTimer.prototype.reset = function() {
    log.verbose('ServerTimer reset');
    this.currentTime = 0;
    this.update();
}

ServerTimer.prototype.next = function() {
    this.currentTime++;
    this.update();
}

ServerTimer.prototype.start = function() {
    if (this.timerId != null)
        return;

    log.verbose('ServerTimer start');

    var self = this;
    this.timerId = setInterval(function() {
        self.next();
    }, 1000);
}

ServerTimer.prototype.stop = function() {
    log.verbose('ServerTimer stop');
    clearInterval(this.timerId);
    this.timerId = null;
}

ServerTimer.prototype.bindSocket = function(app_global, socket) {
    $this = this;

    socket.on(this.controlPath, function(msg) {
        switch (msg) {
            case 'reset':
                $this.reset();
                break;
            case 'start':
                $this.start();
                socket.broadcast.emit($this.controlPath, msg);
                break;
            case 'stop':
                $this.stop();
                socket.broadcast.emit($this.controlPath, msg);
                break;
            case 'get':
                $this.update();
                if ($this.isRunning())
                    $this.emitControl('start');
                else
                    $this.emitControl('stop');
                break;
            case 'debug':
                $this.debug(true);
                break;
        }
    });
}

function ClientTimer(io, socketPath) {
    ServerTimer.call(this, io, socketPath);
}

ClientTimer.prototype = Object.create(ServerTimer.prototype);
ClientTimer.prototype.constructor = ClientTimer;

ClientTimer.prototype.next = function() {
    this.currentTime++;
    if (this.currentTime % 5 == 0) {
        this.update();
    }
};

function control(socket, timer, msg) {
    switch (msg) {
        case 'reset':
            timer.reset();
            break;
        case 'start':
            timer.start();
            socket.broadcast.emit(timer.controlPath, msg);
            break;
        case 'stop':
            timer.stop();
            socket.broadcast.emit(timer.controlPath, msg);
            break;
        case 'get':
            timer.update();
            if (timer.isRunning())
                timer.emitControl('start');
            else
                timer.emitControl('stop');
            break;
        case 'debug':
            timer.debug(true);
            break;
    }
}

module.exports.httpGet = httpGet;
module.exports.control = control;
module.exports.ServerTimer = ServerTimer;
module.exports.ClientTimer = ClientTimer;
