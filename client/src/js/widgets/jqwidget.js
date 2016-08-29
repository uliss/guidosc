var inherits = require('inherits');
var base = require('./base.js');

function JQueryWidget(name, params) {
    base.BaseWidget.call(this, params);
    this.tagName = name;
    this.element = $('<' + name + '/>');
    if(params.id) {
        this.element.attr('id', params.id);
    }
}

inherits(JQueryWidget, base.BaseWidget);

JQueryWidget.prototype.parentElement = function() {
    return $('#' + this.params.parent);
};

JQueryWidget.prototype.show = function() {
    this.element.appendTo(this.parentElement());
};

JQueryWidget.prototype.destroy = function() {
    this.element.remove();
};

JQueryWidget.prototype.appendTo = function(sel) {
    this.element.appendTo($(sel));
};

module.exports.JQueryWidget = JQueryWidget;
