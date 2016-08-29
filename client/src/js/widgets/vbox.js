var inherits = require('inherits');
var box = require('./box.js');

function VBox(params) {
    box.Box.call(this, params);
    this.element.addClass("ui-layout-vbox");
    switch (params.align) {
        case "center":
            this.element.addClass("ui-box-align-center");
            break;
        case "right":
            this.element.addClass("ui-box-align-right");
            break;
        case "left":
            this.element.addClass("ui-box-align-left");
            break;
    }
}

inherits(VBox, box.Box);

function create(params) {
    return new VBox(params);
}

module.exports.VBox = VBox;
module.exports.create = create;
