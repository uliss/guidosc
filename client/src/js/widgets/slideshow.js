var inherits = require('inherits');
var jqw = require('./jqwidget.js');
var widget = require('./index.js');
var tmpl = require('fs').readFileSync(__dirname + '/tmpl/slideshow.html', 'utf8');

var preload_images = [];

// user params:
// noSwipe: - if defined, no swipe support
// hideButtons: (true|false) - if true, hide turn button
function Slideshow(params) {
    var id = params.idx;
    jqw.JQueryWidget.call(this, "div", params);
    this.control = $(tmpl);
    this.control.appendTo(this.element);
    this.button_prev = this.control.find('.prev');
    this.button_next = this.control.find('.next');

    this.button_prev.click(function() {
        widget.find(id).prev();
    });

    this.button_next.click(function() {
        widget.find(id).next();
    });

    var swipeDir = 1;
    // swipe backwards (for comfort sheet music swipe)
    if (params.swipeDir == -1) {
        swipeDir = -1;
    }

    $(document).keydown(function(e) {
        if(e.keyCode == 32 || e.keyCode == 39) { widget.find(id).next(); }
        if(e.keyCode == 37) { widget.find(id).prev(); }
        if(e.keyCode == 35) { widget.find(id).last(); }
        if(e.keyCode == 36) { widget.find(id).first(); }
    });

    if(params.noSwipe === undefined) {
        $('html').on('swipe', function(e, Dx, Dy) {
            if((Dx * swipeDir) == 1) { widget.find(id).next(); }
            if((Dx * swipeDir) == -1) { widget.find(id).prev(); }
        });
    }

    if(params.hideButtons) {
        this.button_next.hide();
        this.button_prev.hide();
    }

    window.addEventListener('orientationchange', function() {
        var win = $(window);
        $bg.css("height", win.height() + "px");
        $bg.css("width", win.width() + "px");
    });
}

inherits(Slideshow, jqw.JQueryWidget);

Slideshow.prototype.prev = function() {
    this.send("prev");
};

Slideshow.prototype.next = function() {
    this.send("next");
};

Slideshow.prototype.first = function() {
    this.send("first");
};

Slideshow.prototype.last = function() {
    this.send("last");
};

Slideshow.prototype.command = function(cmd) {
    if(cmd.url) {
        var win = $(window);
        var win_w = win.width();
        var win_h = win.height();
        $bg = $("html");
        $bg.css("background-attachment", "fixed");
        $bg.css("background-position", "center center");
        $bg.css("background-repeat", "no-repeat");
        $bg.css("background-image", "url('" + cmd.url + "')");
        $bg.css("height", win_h + "px");
        $bg.css("width", win_w + "px");
        $bg.css("background-size", "contain");
    }

    if(cmd.preload) {
        preload_images.shift();
        var img = new Image();
        img.src = cmd.preload;
        preload_images.push(new Image());
    }
};

Slideshow.prototype.destroy = function() {
    $bg = $("html");
    $bg.css("background-attachment", "");
    $bg.css("background-position", "");
    $bg.css("background-repeat", "");
    $bg.css("background-image", "");
    $bg.css("height", "");
    $bg.css("width", "");
    $bg.css("background-size", "");
    this.constructor.super_.prototype.destroy.apply(this);
};

function create(params) {
    var w = new Slideshow(params);
    return w;
}

module.exports.create = create;
