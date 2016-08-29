var inherits = require('inherits');
var nxw = require('./nexuswidget.js');

function prepareParams(params) {
    if(!params.size) {
        params.w = 200;
    }
    else {
        params.w = params.size;
    }

    params.h = params.w * 0.15;

    return params;
}

function Crossfade(params) {
    nxw.NexusWidget.call(this, 'crossfade', prepareParams(params));
}

inherits(Crossfade, nxw.NexusWidget);

function create(params) {
    var w = new Crossfade(params);
    w.bind('*', function(data) {
        w.send(data.value);
    });

    return w;
}

module.exports.create = create;
