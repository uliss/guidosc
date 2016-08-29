var inherits = require('inherits');
var nxw = require('./nexuswidget.js');

function prepareParams(params) {
    if(!params.size)
    params.w = 150;
    else
    params.w = params.size;

    params.h = params.w;

    if(params.width) params.w = params.width;
    if(params.height) params.w = params.height;

    return params;
}

function Tilt(params) {
    nxw.NexusWidget.call(this, 'tilt', prepareParams(params));
}

inherits(Tilt, nxw.NexusWidget);

function create(params) {
    var w = new Tilt(params);
    w.bindAny(function(data) {
        // OSC: /node/ui [ID, xPos, yPos, zPos]
        w.send(data.x, data.y, data.z);
    });
    return w;
}

module.exports.create = create;
