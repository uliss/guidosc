var inherits = require('inherits');
var box = require('./box.js');

function HBox(params) {
    box.Box.call(this, params);
    this.element.addClass("ui-layout-hbox");
}

inherits(HBox, box.Box);

function create(params) {
    return new HBox(params);
}

module.exports.HBox = HBox;
module.exports.create = create;
