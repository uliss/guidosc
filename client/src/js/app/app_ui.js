var widgets = require('../widgets');
var server = require('../server.js');
var utils = require('../utils.js');

var HIDDEN_TARGET = 'ui-elements-hidden';
var PATH_ADD = '/guido/widget/add';
var PATH_UPDATE = '/guido/widget/update';
var PATH_REMOVE = '/guido/widget/remove';
var PATH_REMOVE_ALL = '/guido/widget/removeAll';
var PATH_COMMAND = '/guido/widget/command';

function bindOsc() {
    server.on(PATH_ADD, function(msg) {
        if(!msg || !msg.length) {
            console.log("ERROR: no widget data!");
            return;
        }

        msg = JSON.parse(msg[0]);

        if (!msg.idx) {
            console.log("ERROR: no widget id!");
            return;
        }
        if (!msg.type) {
            console.log("ERROR: no widget type!");
            return;
        }

        msg.id = msg.idx;

        var w = widgets.create(msg.idx, msg.type, msg);

        if (!w) return;

        w.realParent = w.parentId();
        if (w.hidden) { // trick to create hidden nexusUI widgets
            // first we create it on visible parent, then move to hidden
            var target = $('#' + HIDDEN_TARGET);
            if (target.length > 0) {
                w.jQ().detach().appendTo(target);
                w.realParent = HIDDEN_TARGET;
            }
        }

        var layoutId = w.layout;
        // move to layout
        if(layoutId) {
            var layout = $('#' + w.realParent).find('#' + layoutId);
            if(layout.length > 0) {
                w.jQ().detach().appendTo(layout);
            }
        }

        if(w.cssStyle) {
            console.log("css style: " + JSON.stringify(w.cssStyle));
            w.jQ().css(w.cssStyle);
        }
    });

    server.on(PATH_REMOVE, function(id) {
        if (!id) console.log("ERROR: no widget id!");
        widgets.remove(id);
    });

    server.on(PATH_REMOVE_ALL, function() {
        widgets.removeAll();
    });

    server.on(PATH_COMMAND, function(msg) {
        msg = JSON.parse(msg[0]);

        if (!msg.idx) {
            console.log("ERROR: no widget id!");
            return;
        }
        widgets.command(msg.idx, msg);
    });

    server.on(PATH_UPDATE, function(msg) {
        msg = JSON.parse(msg[0]);

        if (!msg.idx) {
            console.log("ERROR: no widget id!");
            return;
        }
        widgets.update(msg.idx, msg);
    });
}

function main() {
    bindOsc();
}

module.exports.main = main;
module.exports.bindOsc = bindOsc;
