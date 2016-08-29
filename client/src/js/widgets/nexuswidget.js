var inherits = require('inherits');
var base = require('./base.js');

function NexusWidget(type, params) {
    base.BaseWidget.call(this, params);
    this.nx_widget = nx.add(type, this.params);
    this.nx_widget.label = this.params.label;
    if(this.params.labelSize) this.nx_widget.labelSize = this.params.labelSize;
    // resize after label change (!)
    this.nx_widget.resize(this.params.w, this.params.h);
    this.nx_widget.oscPath = this.params.oscPath;
    this.nx_widget.colors = $.extend({}, this.nx_widget.colors, this.colorScheme);

    if(this.params.min !== null) this.nx_widget.min = this.params.min;
    if(this.params.max !== null) this.nx_widget.max = this.params.max;

    if(this.params.value !== null) {
        this.nx_widget.val.value = this.params.value;
        this.nx_widget.value = this.params.value;
    }

    this.bind_name = null;
}

inherits(NexusWidget, base.BaseWidget);

NexusWidget.prototype.prepareParams = function(params) {
    if(params.id) params.name = params.id;
    return base.BaseWidget.prototype.prepareParams.call(this, params);
};

NexusWidget.prototype.show = function() { this.nx_widget.draw(); };

NexusWidget.prototype.bind = function(action, callback) {
    console.log("ERROR: You should redefine 'bind' in child classes!");
};

NexusWidget.prototype.unbind = function() {
    console.log("ERROR: You should redefine 'bind' in child classes!");
    if(this.bind_name) {
        this.unbindFrom(this.bind_name);
    }
};

NexusWidget.prototype.bindTo = function(name, callback) {
    bind_name = name;
    this.nx_widget.on(name, callback);
};

NexusWidget.prototype.unbindFrom = function(name) {
    this.nx_widget.removeAllListeners(name);
};

NexusWidget.prototype.bindToValue = function() {
    var $this = this;
    bind_name = 'value';
    this.nx_widget.on('value', function(data) {
        $this.send(data);
    });
};

NexusWidget.prototype.bindAny = function(callback) {
    this.bindTo('*', callback);
};

NexusWidget.prototype.update = function(params) {
    $.extend(this.nx_widget, this.nx_widget, params);

    if(params.value !== null) {
        this.nx_widget.val.value = params.value;
        this.nx_widget.value = params.value;
    }

    this.nx_widget.draw();
};

NexusWidget.prototype.setValue = function(value, transmit) {
    this.nx_widget.set({'value': value}, transmit);
};

NexusWidget.prototype.transmitValue = function() {
    this.nx_widget.transmit(this.nx_widget.val);
};

NexusWidget.prototype.value = function() { return this.nx_widget.val.value; };

NexusWidget.prototype.destroy = function() {
    this.nx_widget.destroy();
};

function makeSquared(params, defaultSize) {
    if(defaultSize === undefined)
        defaultSize = 100;

    if(params.size !== undefined) {
        params.w = params.h = params.size;
    }
    else {
        params.w = params.h = defaultSize;
    }

    return params;
}

module.exports.NexusWidget = NexusWidget;
module.exports.makeSquared = makeSquared;
