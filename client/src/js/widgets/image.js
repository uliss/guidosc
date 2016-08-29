var inherits = require('inherits');
var jqw = require('./jqwidget.js');

function Image(params) {
    jqw.JQueryWidget.call(this, "div", params);
    this.element.addClass("image");
    this.img = $("<img/>").attr("src", params.url);

    if(params.width) this.img.attr("width", params.width);
    if(params.height) this.img.attr("height", params.height);

    this.img.appendTo(this.element);
}

inherits(Image, jqw.JQueryWidget);

function create(params) {
    return new Image(params);
}

Image.prototype.command = function(cmd) {
    if(cmd.url) this.img.attr('src', cmd.url);
};

module.exports.Image = Image;
module.exports.create = create;
