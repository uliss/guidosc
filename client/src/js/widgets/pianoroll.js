var inherits = require('inherits');
var nxw = require('./nexuswidget.js');

function prepareParams(params) {
    if(!params.size) params.w = 600;
    params.w = params.size;
    params.h = params.w / 4.0;

    if(!params.octaves) params.octaves = 3;
    if(!params.mode) params.mode = "button";
    if(!params.midibase) params.midibase = 48;

    return params;
}

function Pianoroll(params) {
    nxw.NexusWidget.call(this, 'keyboard', params);
}

inherits(Pianoroll, nxw.NexusWidget);

function create(params) {
    params = prepareParams(params);
    var w = new Pianoroll(params);
    w.nx_widget.octaves = params.octaves;
    w.nx_widget.mode = params.mode;
    w.nx_widget.midibase = params.midibase;

    w.bind('midi', function(data) {
        var v = data.split(' ');
        w.send(parseInt(v[0]), parseInt(v[1]));
    });

    w.nx_widget.init();
    return w;
}

module.exports.create = create;
