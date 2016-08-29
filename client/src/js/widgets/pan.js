var inherits = require('inherits');
var knob = require('./knob.js');

function Pan(params) {
    knob.Knob.call(this, params);
    this.nx_widget.widgetStyle = 'handle';
    this.nx_widget.angleGap = 0.25;
    this.nx_widget.responsivity = 0.009;

    var $this = this;

    this.nx_widget.canvas.ondblclick = function(event) {
        $this.reset();
    };

    $(this.nx_widget.canvas).on('doubleTap', function() {
        $this.reset();
    });

    this.nx_widget.init();
}

inherits(Pan, knob.Knob);

Pan.prototype.reset = function() {
    this.nx_widget.set({
        'value': 0
    }, true);
    this.nx_widget.init();
};

Pan.prototype.prepareParams = function(params) {
    params = knob.Knob.prototype.prepareParams.call(this, params);

    var defaults = {
        'value': 0,
        'min': -1.0,
        'max': 1.0,
        'colors': {
            accent: "#19B5FE",
            borderhl: "#C0C0CA"
        }
    };

    return $.extend({}, defaults, params);
};

function create(params) {
    // params = prepareParams(params);
    var w = new Pan(params);
    w.bindToValue();
    return w;
}

module.exports.create = create;
