var inherits = require('inherits');
var nxw = require('./nexuswidget.js');

function prepareParams(params) {
    if(!params.size)
    params.w = 300;
    else
    params.w = params.size;

    params.h = params.w;

    if(params.width) params.w = params.width;
    if(params.height) params.h = params.height;

    return params;
}

function Multitouch(params) {
    nxw.NexusWidget.call(this, 'multitouch', params);
}

inherits(Multitouch, nxw.NexusWidget);

function create(params) {
    params = prepareParams(params);
    var w = new Multitouch(params);
    if(params.text) w.nx_widget.text = params.text;
    if(params.mode) w.nx_widget.mode = params.mode;
    if(params.rows) w.nx_widget.rows = params.rows;
    if(params.cols) w.nx_widget.cols = params.cols;
    if(params.matrixLabels) w.nx_widget.matrixLabels = params.matrixLabels;

    w.nx_widget.init();
    w.nx_widget.on('*', function(data) {
        w.send(JSON.stringify(data));
    });

    return w;
}

module.exports.create = create;
