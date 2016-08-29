var inherits = require('inherits');
var jqw = require('./jqwidget.js');

function NewLine(params) {
    jqw.JQueryWidget.call(this, "div", params);
}

inherits(NewLine, jqw.JQueryWidget);

function create(params) {
    return new NewLine(params);
}

module.exports.NewLine = NewLine;
module.exports.create = create;
