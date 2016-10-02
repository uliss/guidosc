var inherits = require('inherits');
var server = require('../server.js');
var jqw = require('./jqwidget.js');


function Params(params) {
    jqw.JQueryWidget.call(this, 'div', params);
    this.element.addClass("widget_params");
    this.load = $("<button>")
        .text("load")
        .addClass("btn")
        .addClass("btn-lg")
        .addClass("btn-info")
        .click(function() {
            var path = $("#ui-modal-load").data("osc_path");
            if (path)
                server.send_to_sc(path, "load");
            else
                console.log("[app_piece.js] no osc path set");
        });

    this.save = $("<button>")
        .text("save")
        .addClass("btn")
        .addClass("btn-lg")
        .addClass("btn-warning")
        .click(function() {
            var path = $("#ui-modal-load").data("osc_path");
            if (path)
                server.send_to_sc(path, "save");
            else
                console.log("[app_piece.js] no osc path set");
        });

    this.element.append(this.save);
    this.element.append(this.load);
}

inherits(Params, jqw.JQueryWidget);

function create(params) {
    var w = new Params(params);
    return w;
}

module.exports.create = create;
module.exports.Params = Params;
