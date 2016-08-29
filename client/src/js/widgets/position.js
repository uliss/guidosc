var inherits = require('inherits');
var nxw = require('./nexuswidget.js');

function prepareParams(params) {
    if(!params.size)
    params.w = 200;
    else
    params.w = params.size;

    params.h = params.w;

    if(params.width) params.w = params.width;
    if(params.height) params.w = params.height;
    return params;
}

function Position(params) {
    nxw.NexusWidget.call(this, 'position', prepareParams(params));
}

inherits(Position, nxw.NexusWidget);

function create(params) {
    var w = new Position(params);
    w.bind('*', function(data) {
        // OSC: /node/ui [ID, xPos, yPos, (move|click|release)]
        w.send(data.x, data.y, data.state);
    });

    return w;
}

module.exports.create = create;
