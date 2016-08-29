var server = require('../server.js');
var utils = require('../utils.js');

function log(msg) {
    var args = Array.prototype.slice.call(arguments, 0);
    console.log("[base.js] " + args.join(' '));
}

function ColorScheme(params) {
    var defaults = {
        "accent": "#ff5500",
        "accenthl": "#ff6f26",
        "border": "#e3e3e3",
        "borderhl": "#727272",
        "fill": "#eeeeee",
        "text": "#000000",
        "black": "#000000"
    };

    var new_params = $.extend({}, defaults, params.colors);
    this.create(new_params);

    if(params.labelColor) {
        this.black = params.labelColor;
    }

    if(params.backgroundColor) {
        this.fill = params.backgroundColor;
    }

    if(params.color) {
        this.accent = params.color;
        this.accenthl = utils.shadeColor(this.accent, 0.2);
    }

    if(params.borderColor) {
        this.border = params.borderColor;
        this.borderhl = utils.shadeColor(this.border, -0.3);
    }
}

ColorScheme.prototype.create = function(params) {
    this.accent = params.accent;
    this.accenthl = params.accenthl;
    this.border = params.border;
    this.borderhl = params.borderhl;
    this.fill = params.fill;
    this.text = params.text;
};

function BaseWidget(params) {
    this.init_params = params;
    if(!params.id) {
        log("no id specified");
        return;
    }

    if(params.hidden) {
        this.hidden = true;
    }

    if(params.layout) {
        this.layout = params.layout;
    }

    if(params.cssStyle) {
        this.cssStyle = params.cssStyle;
    }

    this.params = this.prepareParams(params);
    this.colorScheme = new ColorScheme(this.params);
    this.send_enable = true;
}

BaseWidget.prototype.prepareParams = function(params) {
    var defaults = {
        "x": 0,
        "y": 0,
        "parent": "ui-elements",
        "oscPath": "/ui"
    };

    return $.extend({}, defaults, params);
};

BaseWidget.prototype.id = function() { return this.params.id; };
BaseWidget.prototype.parentId = function() { return this.params.parent; };
BaseWidget.prototype.oscPath = function() { return this.params.oscPath; };
BaseWidget.prototype.destroy = function() { log("method 'destroy' should be redefined in parent classes!"); };
BaseWidget.prototype.update = function() {  };
BaseWidget.prototype.show = function() { log("method 'show' should be redefined in parent classes!"); };
BaseWidget.prototype.command = function() { log("method 'command' should be redefined in parent classes!"); };
BaseWidget.prototype.send = function() {
    if(!this.send_enable) return;

    var args = Array.prototype.slice.call(arguments);
    args.unshift(this.id());
    var full_path = "/node" + this.oscPath();
    // log("socket send:", full_path, JSON.stringify(msg));
    server.send(full_path, args);
};

BaseWidget.prototype.jQ = function() {
    return $('#' + this.id());
};

BaseWidget.prototype.sendEnable = function() {
    this.send_enable = true;
};

BaseWidget.prototype.sendDisable = function() {
    this.send_enable = false;
};

module.exports.BaseWidget = BaseWidget;
module.exports.ColorScheme = ColorScheme;
