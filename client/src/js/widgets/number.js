var inherits = require('inherits');
var nxw = require('./nexuswidget.js');

function NumberWidget(params) {
    // console.log(params);
    nxw.NexusWidget.call(this, 'number', params);
    if (params.rate) this.rate = params.rate;
    if (params.step) this.step = params.step;
    if (params.digits) this.decimalPlaces = params.digits;
    this.nx_widget.draw();
}

inherits(NumberWidget, nxw.NexusWidget);

NumberWidget.prototype.prepareParams = function(params) {
    params = nxw.NexusWidget.prototype.prepareParams.call(this, params);

    if (!params.size)
        params.w = 120;
    else
        params.w = params.size;

    params.h = params.w * 0.5;

    var defaults = {
        'value': 0,
        'min': 0,
        'max': 1000
    };

    return $.extend({}, defaults, params);
};

function create(params) {
    var w = new NumberWidget(params);
    w.bindToValue();
    return w;
}

module.exports.create = create;
module.exports.NumberWidget = NumberWidget;
