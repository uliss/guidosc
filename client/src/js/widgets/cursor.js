var inherits = require('inherits');
var server = require('../server.js');
var jqw = require('./jqwidget.js');

function getCoords(elem) { // кроме IE8-
    var box = elem.getBoundingClientRect();

    return {
        top: box.top + pageYOffset,
        left: box.left + pageXOffset,
        width: box.right - box.left,
        height: box.bottom - box.top
    };
}

var bg_width;
var bg_height;
var bg_xscale;
var bg_yscale;
var bg_xoff;
var bg_yoff;

$(document).ready(function() {
    getBackgroundSize();
});

function getBackgroundSize(fn) {
    var url = $('html').css('background-image').replace(/url\((['"])?(.*?)\1\)/gi, '$2');
    if (url === 'none') {
        setTimeout(function() {
            getBackgroundSize(fn);
        }, 500);
        return;
    }

    $('<img/>').attr('src', url).load(function() {

        bg_width = this.width;
        bg_height = this.height;

        // console.log(this.width);
        // console.log(bg_width + 'x' + bg_height);
        updateBackgroundScale();

        if (fn) fn.call();
    });
}

function updateBackgroundScale() {
    var nw, nh;
    var win_height = $(window).height();
    var win_width = $(window).width();

    if (bg_width > bg_height) { // landscape
        nw = win_width;
        nh = (bg_height / bg_width * nw).toFixed();
    } else {
        nh = win_height;
        nw = (bg_width / bg_height * nh).toFixed();
    }

    bg_xscale = bg_width / nw;
    bg_yscale = bg_height / nh;
    bg_xoff = (win_width - nw) / 2;
    bg_yoff = (win_height - nh) / 2;
}

function cursorCoords(x, y) {
    if (!bg_width) {
        getBackgroundSize();
        return;
    }

    var cursor_x = ((x - bg_xoff) * bg_xscale).toFixed();
    var cursor_y = ((y - bg_yoff) * bg_yscale).toFixed();
    return [cursor_x, cursor_y];
}

$(window).resize(function() {
    updateBackgroundScale();
});

function Cursor(params) {
    jqw.JQueryWidget.call(this, 'div', params);

    this.cursor = $('<div>')
        .addClass("widget_cursor")
        .attr('id', 'cursor')
        .css('z-index', 1000)
        .css('position', 'absolute')
        .detach()
        .appendTo($('body'))
        .dblclick(function(e) {
            if (e.shiftKey) {
                this.send(this.relLeft, this.relTop);
                if (this.cursor.children().length > 0) {
                    this.cursor.empty();
                } else {
                    var popup = $('<div>')
                        .addClass('dimensions')
                        .text(this.relLeft + 'x' + this.relTop)
                        .appendTo(this.cursor);

                    popup.css('top', this.cursor.height() / 2);
                }
            }
        }.bind(this));

    var cursor = this.cursor.get(0);

    console.log("Cursor added");

    this.relLeft = 0;
    this.relTop = 0;
    if (params.x) this.relLeft = params.x;
    if (params.y) this.relTop = params.y;

    var self = this;
    getBackgroundSize(function() {
        self.updatePos();
    });

    cursor.onmousedown = function(e) {
        if (e.which != 1) { // если клик правой кнопкой мыши
            return; // то он не запускает перенос
        }

        var coords = getCoords(cursor);
        var shiftX = e.pageX - coords.left;
        var shiftY = e.pageY - coords.top;

        self.moveAt(e.pageX - shiftX, e.pageY - shiftY);

        document.onmousemove = function(e) {
            self.moveAt(e.pageX - shiftX, e.pageY - shiftY);
        };

        cursor.onmouseup = function() {
            document.onmousemove = null;
            cursor.onmouseup = null;
        };
    };

    $(window).resize(function() {
        self.updatePos();
    });
}

inherits(Cursor, jqw.JQueryWidget);

Cursor.prototype.moveAt = function(x, y) {
    var cursor = this.cursor.get(0);
    var coords = getCoords(cursor);

    cursor.style.left = x + 'px';
    cursor.style.top = y + 'px';

    var cc = cursorCoords(x + coords.width / 2, y + coords.height / 2);
    this.relTop = cc[1];
    this.relLeft = cc[0];

    this.updateDims();
};

Cursor.prototype.updateDims = function() {
    if (this.cursor.children().length > 0) {
        this.cursor.children().text(this.relLeft + 'x' + this.relTop);
    }
};

Cursor.prototype.setRel = function(x, y) {
    this.relLeft = x;
    this.relTop = y;
    this.updatePos();
};

Cursor.prototype.updatePos = function() {
    var cursor = this.cursor.get(0);
    var coords = getCoords(cursor);
    var x = ((this.relLeft / bg_xscale) + bg_xoff - coords.width / 2).toFixed();
    var y = ((this.relTop / bg_yscale) + bg_yoff - coords.height / 2).toFixed();
    this.cursor.css("left", x + 'px');
    this.cursor.css("top", y + 'px');

    // cursor.style.left = x + 'px';
    // cursor.style.top = y + 'px';
    this.updateDims();
};

Cursor.prototype.command = function(cmd) {
    if (cmd.rel) {
        this.setRel(cmd.rel[0], cmd.rel[1]);
    }

    if (cmd.pulse) {
        this.cursor.animate({
            opacity: 0.6
        }, 200, function() {
            this.cursor.css("opacity", 0.33);
        }.bind(this));
    }
};

Cursor.prototype.destroy = function() {
    this.cursor.remove();
    jqw.JQueryWidget.destroy.call(this);
};

function create(params) {
    var w = new Cursor(params);
    return w;
}

module.exports.create = create;
module.exports.Cursor = Cursor;
