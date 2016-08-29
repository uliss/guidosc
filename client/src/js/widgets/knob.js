var inherits = require('inherits');
var nxw = require('./nexuswidget.js');

function Knob(params) {
    nxw.NexusWidget.call(this, 'dial', params);
    this.nx_widget.responsivity = 0.007;
    this.nx_widget.resize(this.params.w, this.params.h);

    if (this.params.angleGap) this.nx_widget.angleGap = this.params.angleGap;
    else this.nx_widget.angleGap = 0.0;

    if (this.params.style) this.nx_widget.widgetStyle = this.params.style;

    this.nx_widget.init();
}

inherits(Knob, nxw.NexusWidget);

Knob.prototype.prepareParams = function(params) {
    params = nxw.NexusWidget.prototype.prepareParams.call(this, params);

    if (!params.size)
        params.w = 100;
    else
        params.w = params.size;

    params.h = params.w;

    return params;
};

function create(params) {
    var w = new Knob(params);
    w.bindToValue();
    return w;
}

module.exports.create = create;
module.exports.Knob = Knob;
