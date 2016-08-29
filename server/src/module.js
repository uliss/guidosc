function Module(app_global) {
    this.app_global = app_global;
}

Module.prototype.io = function() {
    return this.app_global.io;
};

Module.prototype.app = function() {
    return this.app_global.app;
};

Module.prototype.oscClient = function() {
    return this.app_global.osc.client;
};

Module.prototype.oscSend = function() {
    return this.app_global.osc.client.send(arguments);
};

Module.prototype.oscServer = function() {
    return this.app_global.osc.server;
};

Module.prototype.onOSC = function(path, func) {
    this.oscServer().on(path, func);
};

module.exports.Module = Module;
