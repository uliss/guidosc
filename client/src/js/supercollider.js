var server = require('./server.js');

var DEFAULT_STATE = {
    'boot': false,
    'record': false,
    'mute': false,
    'volume': 0
};
var server_state = DEFAULT_STATE;
var update_subscribers = [];
var GUIDO_PATH = '/guido/supercollider';

function log(msg) {
    var args = Array.prototype.slice.call(arguments, 0);
    console.log("[supercollider.js] " + args.join(' '));
}

function subscribe_update(func) {
    update_subscribers.push(func);
}

function check_for_promise(resolve, reject, error_msg, time) {
    if (!time) time = 2000;

    server.on(GUIDO_PATH, function(msg) {
        if (msg[0] == "state") {
            var state = JSON.parse(msg[1]);
            if (!state) {
                reject(new Error("invalid JSON!"));
            }

            update_subscribers.forEach(function(func) {
                func(server_state);
            });

            resolve(state);
        }
    });

    setTimeout(function() {
        reject(new Error(error_msg));
    }, time);
}

function supercollider_promise(args, err_msg, timeout) {
    if (!err_msg) err_msg = "no info from supercollider";
    if (!timeout) timeout = 2000;

    return new Promise(function(resolve, reject) {
        server.send_to_sc(GUIDO_PATH, args);
        check_for_promise(resolve, reject, err_msg, timeout);
    });
}

// returns promise to get server state
function promise_state() {
    return supercollider_promise(['state?'], "get state timeout!");
}

// returns promise to mute server
function promise_mute(mute_value) {
    return supercollider_promise(['mute', mute_value], "mute timeout!", 1000);
}

// promise to boot server
function promise_boot() {
    return supercollider_promise(['boot', 1], "boot timeout!", 3000);
}

// promise to return booted server
function promise_get_booted() {
    return promise_state().then(
        function(state) {
            if (!state.boot) { // boot server if already not
                return promise_boot();
            }
            return DEFAULT_STATE;
        }
    );
}

// promise to quit server
function promise_quit() {
    return supercollider_promise(['boot', 0], "quit timeout!", 3000);
}

// promise to start/stop record
function promise_record(value) {
    return supercollider_promise(['record', value], "quit timeout!", 2000);
}

function handle_ok(callback) {
    return function(state) {
        server_state = state;
        if (callback) callback(state);
    };
}

function handle_error(callback, msg) {
    return function(error) {
        server_state = DEFAULT_STATE;
        if (callback) callback(server_state);
        log(error.message);
    };
}

function get_state(callback) {
    promise_state().then(
        handle_ok(callback),
        handle_error(callback)
    );
}

function boot(callback) {
    promise_get_booted().then(
        handle_ok(callback),
        handle_error(callback)
    );
}

function boot_toggle(callback) {
    if (server_state.boot) {
        quit(callback);
    } else {
        boot(callback);
    }
}

function mute(mute_value, callback) {
    promise_mute(mute_value).then(
        handle_ok(callback),
        handle_error(callback)
    );
}

function mute_toggle(callback) {
    if (server_state.mute) {
        mute(0, callback);
    } else {
        mute(1, callback);
    }
}

function quit(callback) {
    // 1. know sc state
    promise_state()
        .then(function(state) { // 2. try to stop record (if started)
            return promise_record(0);
        })
        .then(function(state) { // 3. quit sc
            return promise_quit();
        }).then(
            handle_ok(callback),
            handle_error(callback)
        );
}

function recort_start(callback) {
    // 1. get boot server
    promise_get_booted().then(
            // 2. start record
            function(state) {
                return promise_record(1);
            }
        )
        .then(
            handle_ok(callback),
            handle_error(callback)
        );
}

function record_stop(callback) {
    // 1. get state
    promise_state().then(
            function(state) {
                // 2. try to stop record if needed
                if (state.record) {
                    return promise_record(0);
                } else {
                    return state;
                }
            }
        )
        .then(
            handle_ok(callback),
            handle_error(callback)
        );
}

function record(value, callback) {
    if (value) record_start(callback);
    else record_stop(callback);
}


function record_toggle(callback) {
    if (server_state.record) {
        record_stop(callback);
    } else {
        recort_start(callback);
    }
}

function volume(v) {
    server.send_to_sc(GUIDO_PATH, ['volume', v]);
}

function stop_all() {
    server.send_to_sc(GUIDO_PATH, ['stop_all']);
}

function free_all() {
    server.send_to_sc(GUIDO_PATH, ['free_all']);
}

// on loads binds to socket "state" message
get_state();

module.exports.state = get_state;
module.exports.boot = boot;
module.exports.boot_toggle = boot_toggle;
module.exports.quit = quit;

module.exports.record = record;
module.exports.record_toggle = record_toggle;

module.exports.mute = mute;
module.exports.mute_toggle = mute_toggle;
module.exports.volume = volume;

module.exports.state_subscribe = subscribe_update;

module.exports.stop_all = stop_all;
module.exports.free_all = free_all;
