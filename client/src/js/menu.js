var supercollider = require('./supercollider.js');

function log(msg) {
    var args = Array.prototype.slice.call(arguments, 0);
    console.log('[menu.js]:' + args.join(' '));
}

function update(state) {
    update_boot(state);
    update_record(state);
    update_mute(state);
    update_volume(state);
}

function update_boot(state) {
    var el_title = $("#nav_ui_boot .text");
    var el_icon = $("#nav_ui_boot .glyphicon");

    if(state.boot) {
        el_title.text("Stop supercollider");
        el_icon.removeClass("glyphicon-off");
        el_icon.addClass("glyphicon-remove");
    }
    else {
        el_title.text("Boot supercollider");
        el_icon.removeClass("glyphicon-remove");
        el_icon.addClass("glyphicon-off");
    }
}

function update_mute(state) {
    var el_icon = $("#nav_ui_mute .glyphicon");

    if(state.mute) {
        el_icon.removeClass("glyphicon-volume-up");
        el_icon.addClass("glyphicon-volume-off");
        el_icon.addClass("text-danger");
    }
    else {
        el_icon.removeClass("text-danger");
        el_icon.removeClass("glyphicon-volume-off");
        el_icon.addClass("glyphicon-volume-up");
    }
}

function update_volume(state) {
    var el = $('#nav_ui_volume_slider_input');
    if(el.data("ignore")) return;

    el.slider('setValue', state.volume, false, false);
}

function update_record(state) {
    var el_title = $("#nav_ui_record .text");
    var el_icon = $("#nav_ui_record .glyphicon");

    if(state.record) {
        el_title.text("Stop Recording");
        el_icon.addClass("text-danger");
    }
    else {
        el_title.text("Record");
        el_icon.removeClass("text-danger");
    }
}

function init_mute() {
    $("#nav_ui_mute").click(function(){ supercollider.mute_toggle(update_mute); });
}

function init_free_all() {
    $(".nav_ui_free_all").click(function() { supercollider.free_all(); });
}

function init_stop_all() {
    $(".nav_ui_stop_all").click(function() { supercollider.free_all(); });
}

function init_volume() {
    var el = $('#nav_ui_volume_slider_input');

    el.data('ignore', false)
    .slider({ formatter: function(value) { return value + ' db'; }})
    .on('slideStart', function() { el.data("ignore", true); })
    .on('slideStop', function() { el.data("ignore", false); })
    .on('slide', function(event) { supercollider.volume(event.value); });
}

function init_record() {
    $("#nav_ui_record").click(function() { supercollider.record_toggle(update_record); });
}

function init_boot() {
    $("#nav_ui_boot").click(function() { supercollider.boot_toggle(update_boot); });
}

function init_all() {
    $(document).ready(function(){
        supercollider.state_subscribe(update);

        init_free_all();
        init_stop_all();
        init_mute();
        init_volume();
        init_record();
        init_boot();

        // state request
        supercollider.state();
    });
}


module.exports.init = init_all;
