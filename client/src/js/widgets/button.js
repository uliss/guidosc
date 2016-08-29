var inherits = require('inherits');
var nxw = require('./nexuswidget.js');

function prepareParams(params) {
    params = nxw.makeSquared(params, 100);
    return params;
}

function Button(params) {
    nxw.NexusWidget.call(this, 'button', prepareParams(params));
    this.nx_widget.mode = "toggle";
    this.nx_widget.init();
}

inherits(Button, nxw.NexusWidget);

function create(params) {
    var w = new Button(params);
    w.bind('press', function(data) {
        w.send(data);
    });
    return w;
}

module.exports.create = create;
module.exports.Button = Button;
