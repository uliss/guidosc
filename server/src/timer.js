var inherits = require('inherits');
var utils = require('./utils');
var mod = require('./module.js');
var log = utils.log('timer');

function ServerTimer(app_global) {
    mod.Module.call(this, app_global, 'timer');
    this.currentTime = 0;
    this.timerId = null;

    this.addCommand('start', 'starts timer', function() {
        this.start();
    }, {
        broadcast: 'all'
    });

    this.addCommand('stop', 'stops timer', function() {
        this.stop();
    }, {
        broadcast: 'all'
    });

    this.addCommand('reset', 'resets timer', function() {
        this.reset();
    });

    this.addCommand('get', 'get current time', function() {
        return this.currentTime;
    });

    this.addCommand('set', 'set current time', function(t) {
        this.setTime(t);
    });

    this.addCommand('state', 'get current state', function() {
        return this.isRunning();
    });
}

inherits(ServerTimer, mod.Module);

ServerTimer.prototype.isRunning = function() {
    return this.timerId != null;
}

ServerTimer.prototype.update = function() {
    log.debug('ServerTimer:', this.currentTime.toHHMMSS());
    this.broadcast({
        time: this.currentTime
    });
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

ServerTimer.prototype.setTime = function(t) {
    t = parseFloat(t);
    log.verbose('ServerTimer set time:', t.toHHMMSS());
    this.currentTime = t;
    this.update();
}

module.exports.ServerTimer = ServerTimer;
