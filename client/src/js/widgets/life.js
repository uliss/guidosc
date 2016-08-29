var inherits = require('inherits');
var nxw = require('./nexuswidget.js');
var widget = require('./index.js');
var tmpl = require('fs').readFileSync(__dirname + '/tmpl/life.html', 'utf8');

function prepareParams(params) {
    params = nxw.makeSquared(params, 200);

    if(!params.rows) params.rows = 10;
    if(!params.cols) params.cols = 10;
    if(!params.interval) params.interval = 1000;

    return params;
}

function Life(params) {
    this.control = $(tmpl).appendTo('#' + params.parent);
    this.target = this.control.find('.target');
    this.target.attr('id', 'container_' + params.idx);
    this.button = this.control.find('button').data("state", 0);
    this.button_label = this.button.find('.text');
    this.button_icon = this.button.find('.glyphicon');
    this.time = params.interval;
    this.interval = null;
    this.is_playing = false;

    this.button.click( function() { widget.find(params.idx).toggle(); });

    params.parent = 'container_' + params.idx;
    nxw.NexusWidget.call(this, 'matrix', params);
    this.nx_widget.row = params.rows;
    this.nx_widget.col = params.cols;
    if(params.matrix) this.nx_widget.matrix = params.matrix;

    this.nx_widget.init();
    // this is important
    for(var i = 0; i < params.rows; i++) { this.nx_widget.matrix[i].fill(0);}
}

inherits(Life, nxw.NexusWidget);

Life.prototype.start = function() {
    this.button.data("state", 1);
    this.button.removeClass("btn-success");
    this.button.addClass("btn-danger");
    this.button_label.text('Stop');
    this.button_icon.removeClass("glyphicon-play");
    this.button_icon.addClass("glyphicon-stop");

    this.interval = setInterval(this.nx_widget.life, this.time);
    this.is_playing = true;
};

Life.prototype.stop = function() {
    this.button.data("state", 0);
    this.button.addClass("btn-success");
    this.button.removeClass("btn-danger");
    this.button_label.text('Start');
    this.button_icon.addClass("glyphicon-play");
    this.button_icon.removeClass("glyphicon-stop");

    clearInterval(this.interval);
    this.is_playing = false;
};

Life.prototype.toggle = function() {
    if(this.is_playing) this.stop();
    else this.start();
};

Life.prototype.destroy = function() {
    clearInterval(this.interval);
    this.control.remove();
    this.constructor.super_.prototype.destroy.apply(this);
};

function create(params) {
    var w = new Life(prepareParams(params));
    w.bindAny(function(data) {
        if(data.grid) {
            w.send("grid", data.grid);
        }
    });

    return w;
}

module.exports.create = create;
