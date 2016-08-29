var inherits = require('inherits');
var nxw = require('./nexuswidget.js');

function prepareParams(params) {
    params = nxw.makeSquared(params, 200);

    if(!params.row) params.row = 4;
    if(!params.col) params.col = 4;

    return params;
}

function Matrix(params) {
    nxw.NexusWidget.call(this, 'matrix', params);
}

inherits(Matrix, nxw.NexusWidget);

function create(params) {
    params = prepareParams(params);
    var w = new Matrix(params);
    w.nx_widget.row = params.row;
    w.nx_widget.col = params.col;
    if(params.matrix) w.nx_widget.matrix = params.matrix;

    w.nx_widget.init();
    w.bind('*', function(data) {
        w.send(data.row, data.col, data.level);
    });

    return w;
}

module.exports.create = create;
