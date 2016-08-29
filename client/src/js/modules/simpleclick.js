var server = require('../server.js');
var nbx = require('../widgets/number.js');
var sl = require('../widgets/slider.js');
var OSC_PATH = "/utils/instr";
var INSTRUMENT = "utils.click";


function SimpleClick() {
    var id = 'unit-simpleclick';
    var el = $('div[data-module^=simpleclick]').attr('id', id);

    if (el.length < 1) return;

    var btn = $('<button>')
        .addClass('btn')
        .addClass('btn-lg')
        .addClass('btn-primary')
        .text('click')
        .attr('data-bpm', 60)
        .click(function() {
            btn.toggleClass('active');

            var on = false;
            if (btn.hasClass('active')) {
                on = true;
            }

            if (on)
                server.send_to_sc(OSC_PATH, INSTRUMENT, "play", "bpm", btn.attr('data-bpm'));
            else
                server.send_to_sc(OSC_PATH, INSTRUMENT, "stop");
        });

    el.append(btn);

    var w = new nbx.NumberWidget({
        'id' : id + '_nbx',
        'parent': id,
        'size': 90,
        'min': 30,
        'max': 400,
        'value': 60
    });

    w.bindTo('value', function(msg) {
        btn.attr('data-bpm', msg);
        server.send_to_sc(OSC_PATH, INSTRUMENT, "set", "bpm", btn.attr('data-bpm'));
    });

    var slider = new sl.Slider({
        'id' : id + '_sl',
        'parent': id,
        'horizontal': true,
        'value': 1,
        'min': 0,
        'max': 4
    });
    slider.bindTo('value', function(msg) {
        server.send_to_sc(OSC_PATH, INSTRUMENT, "set", "amp", parseFloat(msg));
    });
}

function init(name) {
    $(document).ready(function() {
        SimpleClick();
    });
}

module.exports = init;
