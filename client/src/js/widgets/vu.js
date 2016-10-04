var inherits = require('inherits');
var nxw = require('./nexuswidget.js');

function VU(params) {
    params.min = 0;
    params.max = 1.0;
    params.value = 0;
    nxw.NexusWidget.call(this, 'vu', params);
}

inherits(VU, nxw.NexusWidget);

VU.prototype.command = function (cmd) {
    if(cmd.state) {
        this.nx_widget.rms = cmd.state[0];
        this.nx_widget.peak = cmd.state[1];
        this.nx_widget.draw();
    }
};

function create(params) {
    var w = new VU(params);
    return w;
}

module.exports.create = create;
module.exports.VU = VU;
