var server = require('./server.js');
var utils = require('./utils.js');

var PING_PATH = "/guido/ping";

function ping_return() {
    return new Promise(function(resolve, reject) {
        server.send_to_sc(PING_PATH);
        server.from_sc(PING_PATH, function(msg) {
            resolve();
        });

        setTimeout(function() {
            reject(new Error("ping timeout!"));
        }, 1000);
    });
}

function set_indicator_state(state) {
    var indicator = $("#nav_ui_connection_indicator");

    if (state) {
        indicator.removeClass("nav_ui_indicator_disconnected");
        indicator.addClass("nav_ui_indicator_connected");
    } else {
        indicator.removeClass("nav_ui_indicator_connected");
        indicator.addClass("nav_ui_indicator_disconnected");
    }
}

function update_indicator() {
    ping_return()
        .then(
            function() {
                set_indicator_state(true);
            },
            function(error) {
                set_indicator_state(false);
            }
        );
}

function start(update_time) {
    if (!update_time) update_time = 4000;

    update_indicator();
    var ping_interval_obj = setInterval(update_indicator, update_time);
}

module.exports.start = start;
module.exports._test = {
    update_indicator: update_indicator
};
