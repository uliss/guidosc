var inherits = require('inherits');
var nxw = require('./nexuswidget.js');

function prepareParams(params) {
    return nxw.makeSquared(params, 100);
}

function Toggle(params) {
    nxw.NexusWidget.call(this, 'toggle', prepareParams(params));
}

inherits(Toggle, nxw.NexusWidget);

function create(params) {
    var w = new Toggle(params);
    w.bindToValue();
    return w;
}

module.exports.create = create;
