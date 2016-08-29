var inherits = require('inherits');
var btn = require('./button.js');

function TouchButton(params) {
    btn.Button.call(this, params);
    this.nx_widget.mode = "aftertouch";
    this.nx_widget.init();
}

inherits(TouchButton, btn.Button);

function create(params) {
    var w = new TouchButton(params);
    w.bindAny(function(data) {
        if(data.press !== undefined) {
            if(data.x !== undefined) {
                w.send("press", data.press, data.x, data.y);
            }
            else {
                w.send("press", data.press);
            }
        }

        if(data.x !== undefined) {
            w.send("pos", data.x, data.y);
        }
    });
    return w;
}

module.exports.create = create;
