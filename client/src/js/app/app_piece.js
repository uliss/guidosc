var app_ui = require('./app_ui.js');
var server = require('../server.js');
var utils = require('../utils.js');
var cli_path = utils.cli_path;

var done = false;

function create_ui() {
    $("#ui-modal-load").click(function() {
        var path = $("#ui-modal-load").data("osc_path");
        if (path)
            server.send_to_sc(path, "load");
        else
            console.log("[app_piece.js] no osc path set");
    });

    $("#ui-modal-save").click(function() {
        var path = $("#ui-modal-load").data("osc_path");
        if (path)
            server.send_to_sc(path, "save");
        else
            console.log("[app_piece.js] no osc path set");
    });

    server.on(cli_path('/app/piece/set_osc_path'), function(msg) {
        var path = msg[0].slice(3);
        $("#ui-modal-load").data("osc_path", path);
        $("#ui-modal-save").data("osc_path", path);
    });

    app_ui.bindOsc();
}

function disableUnwantedTurns(el) {
    el.on("touchmove", function(event) {
        event.preventDefault();
    });
    el.bind('swipe touchmove', function(event) {
        event.stopPropagation();
    });
}

function main() {
    create_ui();

    disableUnwantedTurns($("#ui-piece-modal"));
    disableUnwantedTurns($("#ui-piece-toolbar"));

    // activate swipe on button == click
    $(".modal-footer button").on("touchstart", function(event) { event.target.click(); });
    $("#ui-piece-toolbar button").on("touchstart", function(event) { event.target.click(); });
}

module.exports.main = main;
