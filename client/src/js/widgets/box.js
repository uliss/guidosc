var inherits = require('inherits');
var jqw = require('./jqwidget.js');

function Box(params) {
    jqw.JQueryWidget.call(this, "div", params);
    this.element.addClass("ui-layout-box");
    this.processParams(params);
}

inherits(Box, jqw.JQueryWidget);

Box.prototype.processParams = function(params) {
    if (params.backgroundColor) {
        this.element.css("background-color", params.backgroundColor);
    }

    if (params.borderColor) {
        this.element.css("border", "1px solid " + params.borderColor);
    }

    if (params.width) {
        this.element.css("width", params.width);
    }

    if (params.height) {
        this.element.css("width", params.width);
    }

    if (params.title) {
        var el = this.element.find(".title");
        if (el.length > 0) {
            el.text(params.title);
        } {
            $("<div>").addClass("title").text(params.title).prependTo(this.element);
        }
    }

    if (params.titleIcon) {
        var title = this.element.find(".title");
        if (title.length > 0) {
            title.prepend($('<span class="glyphicon">').addClass('glyphicon-' + params.titleIcon));
        }
    }
};

Box.prototype.update = function(params) {
    this.processParams(params);
};

module.exports.Box = Box;
