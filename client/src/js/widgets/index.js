var _ = require('underscore');
var create_functions = {};
var all_widgets = {};

create_functions.crossfade = require('./crossfade.js');
create_functions.nl = require('./nl.js');
create_functions.image = require('./image.js');
create_functions.button = require('./button.js');
create_functions.touchbutton = require('./touchbutton.js');
create_functions.position = require('./position.js');
create_functions.number = require('./number.js');
create_functions.knob = require('./knob.js');
create_functions.toggle = require('./toggle.js');
create_functions.pianoroll = require('./pianoroll.js');
create_functions.matrix = require('./matrix.js');
create_functions.slider = require('./slider.js');
create_functions.tilt = require('./tilt.js');
create_functions.motion = require('./motion.js');
create_functions.life = require('./life.js');
create_functions.slideshow = require('./slideshow.js');
create_functions.playcontrol = require('./playcontrol.js');
create_functions.multitouch = require('./multitouch.js');
create_functions.pan = require('./pan.js');
create_functions.hbox = require('./hbox.js');
create_functions.vbox = require('./vbox.js');

function log(msg) {
    var args = Array.prototype.slice.call(arguments, 0);
    console.log("[widgets.js] " + args.join(' '));
}

function create(id, type, params) {
    if(!id) {
        log("invalid widget id given");
        return null;
    }

    if(!type) {
        log("invalid widget type given");
        return null;
    }

    if(all_widgets[id]) {
        log("widget already exists:", id);
        return null;
    }

    try {
        // console.log(params);
        var widget = create_functions[type].create(params);
        all_widgets[id] = widget;
        // console.log(widget);
        widget.show();
        return widget;
    }
    catch(e) {
        log("error while creating widget:", e.name, e.message);
    }
}

function remove(id) {
    if(!id) {
        log("invalid widget id given");
        return;
    }

    if(all_widgets[id]) {
        log("removing widget:", id);
        all_widgets[id].destroy();
        delete all_widgets[id];
        return;
    }

    log("[remove] unknown widget with id:", id);
}

function removeAll() {
    _.each(all_widgets, function(w, id) {
        w.destroy();
    });

    all_widgets = {};
}

function command(id, params) {
    if(!id) {
        log("invalid widget id given");
        return;
    }

    if(all_widgets[id]) {
        // log("command to widget:", id, p);
        all_widgets[id].command(params);
        return;
    }

    log("[command] unknown widget with id:", id);
}

function update(id, params) {
    if(!id) {
        log("invalid widget id given");
        return;
    }

    if(all_widgets[id]) {
        // log("updating widget", id);
        all_widgets[id].update(params);
        return;
    }

    log("[update] unknown widget with id:", id);
}

function find(id) {
    return all_widgets[id];
}

module.exports.create = create;
module.exports.remove = remove;
module.exports.removeAll = removeAll;
module.exports.command = command;
module.exports.update = update;
module.exports.find = find;
