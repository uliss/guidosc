var server = require('../server.js');
var w = require('../widgets');
var OSC_PATH = "/utils/instr";


function Piano() {
    var el = $('div[data-module^=piano]');
    if (el.length < 1) return;

    var id = 'unit-piano';

    el.attr('id', id);
    var widget = w.create('unit-piano-widget', 'pianoroll', {
        'oscPath': '/ui',
        'min': 1,
        'max': 100,
        'value': 100,
        'size': 500,
        'id': 'unit-piano-widget',
        'parent': id
    });

    widget.nx_widget.removeAllListeners('midi');
    widget.bindTo('midi', function(msg) {
        var data = msg.split(' ');
        console.log(data);
        if(data[1] == 1) {
            server.send_to_sc(OSC_PATH, "midi.piano1", "play", "note", parseFloat(data[0]));
        }
        else {
            server.send_to_sc(OSC_PATH, "midi.piano1", "stop");
        }
    });
}

function init(name) {
    $(document).ready(function() {
        Piano();
    });
}

module.exports = init;
