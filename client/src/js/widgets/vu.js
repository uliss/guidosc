var inherits = require('inherits');
var nxw = require('./nexuswidget.js');

function VU(params) {
    params.min = 0;
    params.max = 1.0;
    params.value = 0;
    nxw.NexusWidget.call(this, 'vu', params);

    // if (this.params.mode)
    //     this.nx_widget.mode = this.params.mode;
    //
    // if (this.params.horizontal) {
    //     this.nx_widget.hslider = true;
    // }
    //
    // this.nx_widget.init();
}

inherits(VU, nxw.NexusWidget);

VU.prototype.command = function (cmd) {
    console.log(cmd);
    if(cmd.state) {
        this.setValue(cmd.state[0]);
    //     console.log("")
    }
};

function create(params) {
    var w = new VU(params);
    return w;
}

module.exports.create = create;
module.exports.VU = VU;
