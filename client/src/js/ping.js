var server = require('./server.js');

var ping_interval_obj = null;
var ping_answered = false;

function ping_start(time) {
    if(!time) time = 4000;

    var el = $("#nav_ui_connection_indicator");
    server.send("/node/ping");

    ping_interval_obj = setInterval(function(){
        server.send("/node/ping");
        ping_answered = false;

        setTimeout(function(){
            if(!ping_answered) {
                el.removeClass("nav_ui_indicator_connected");
                el.addClass("nav_ui_indicator_disconnected");
            }
        }, 1000);
    }, time);

    server.on('/cli/pong', function(msg) {
        el.removeClass("nav_ui_indicator_disconnected");
        el.addClass("nav_ui_indicator_connected");
        ping_answered = true;
    });
}

function start() {
    $(document).ready(function(){
        ping_start();
    });
}

module.exports.start = start;
