var server = require('../server.js');
var w = require('../widgets');
var sl = require('../widgets/slider.js');
var _ = require('underscore');
var OSC_PATH = "/utils/instr";

var instrument_cnt = 0;

function make_instrument_id() {
    instrument_cnt += 1;
    return 'instr_' + instrument_cnt;
}

function make_instrument_cont_id() {
    instrument_cnt += 1;
    return 'instr_cont_' + instrument_cnt;
}

/**
 * Parses parameters string
 * @param string to parse
 * @return list of params: ["param1", 1.0, "param2", 0.2] for "param1=1.0,param2=0.2"
 */
function parse_params(str) {
    var res = [];
    if (!str) return res;

    _.each(str.split(','), function(i) {
        var pair = i.trim().split('=');
        res.push(pair[0].trim());
        res.push(parseFloat(pair[1].trim()));
    });

    return res;
}

/**
 * Parses parameters from attribute *data-play-param*
 * @see parse_params()
 */
function parse_play_params(jq_el) {
    return parse_params(jq_el.attr('data-play-param'));
}

/**
 * Parses parameters from attribute *data-play-param*
 * @param jq_el - element
 * @return release time
 */
function parse_release_params(jq_el) {
    var t = jq_el.attr('data-release-param');
    if(!t) return 0.1;
    return parseFloat(t);
}

function Instrument(name) {
    var el = $('div[data-module^=instrument][data-name="' + name + '"]').attr('title', name);

    var btn = $('<button>')
        .addClass('btn')
        .addClass('btn-lg')
        .addClass('btn-default')
        .append($('<span class="glyphicon glyphicon-volume-up"/>'))
        .append($('<span>' + name + '</span>'))
        .click(function() {
            btn.toggleClass('active');
            btn.toggleClass('btn-primary');
            btn.toggleClass('btn-default');
            if (btn.hasClass('active')) {
                var params = parse_play_params(el);
                server.send_to_sc.apply(this, [OSC_PATH, name, "play", "amp", widget.value(), "attackTime", 0.2].concat(params));
            } else {
                var tm = parse_release_params(el);
                server.send_to_sc(OSC_PATH, name, "release", tm);
            }
        });

    el.append(btn);

    var parent_id = make_instrument_cont_id();
    var amp_slider = $('<span>').attr('id', parent_id).addClass('slider');
    el.append(amp_slider);

    var widget = new sl.Slider({
        'size': 200,
        'min': 0.0,
        'max': 1.0,
        'id': make_instrument_id(),
        'parent': parent_id,
        'horizontal': true
    });
    // widget.nx_widget.init();
    // widget.nx_widget.removeAllListeners('value');
    widget.bindTo('value', function(amp) {
        server.send_to_sc(OSC_PATH, name, "set", "amp", amp);
    });
    widget.setValue(0.1);

}

function init(name) {
    $(document).ready(function() {
        Instrument(name);
    });
}

module.exports = Instrument;
