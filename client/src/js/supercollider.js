var server = require('./server.js');

var DEFAULT_STATE = {'boot': false, 'record': false, 'mute': true, 'volume': 0 };
var server_state = DEFAULT_STATE;
var update_subscribers = [];

function log(msg) {
    var args = Array.prototype.slice.call(arguments, 0);
    console.log("[supercollider.js] " + args.join(' '));
}

function subscribe_update(func) {
    update_subscribers.push(func);
}

function init_socket_io() {
    server.on('/cli/supercollider', function(msg) {
        if(msg[0] == "state") {
            var json = JSON.parse(msg[1]);
            if(!json) {
                log("invalid JSON data", msg[1]);
                return;
            }
            server_state = json;
            update_subscribers.forEach(function(func){
                func(server_state);
            });
        }
        else {
            log("unknown message: ", msg);
        }
    });
}

function check_for_promise(resolve, reject, error_msg, time) {
    if(!time) time = 2000;

    server.on('/cli/supercollider', function(msg) {
        if(msg[0] == "state") {
            var state = JSON.parse(msg[1]);
            if(!state) {
                reject(new Error("invalid JSON!"));
            }

            resolve(state);
        }
    });

    setTimeout(function() { reject(new Error(error_msg)); }, time);
}

// returns promise to get server state
function promise_state() {
    return new Promise(function(resolve, reject) {
        server.send('/node/supercollider', ['state?']);
        check_for_promise(resolve, reject, "get state timeout!");
    });
}

// returns promise to mute server
function promise_mute(mute_value) {
    return new Promise(function(resolve, reject) {
        server.send('/node/supercollider', ['mute', mute_value]);
        check_for_promise(resolve, reject, "mute timeout!", 1000);
    });
}

// promise to boot server
function promise_boot() {
    return new Promise(function(resolve, reject) {
        server.send('/node/supercollider', ['boot', 1]);
        check_for_promise(resolve, reject, "boot timeout!", 3000);
    });
}

// promise to return booted server
function promise_get_booted() {
    return promise_state().then(
        function(state) {
            if(!state.boot) { // boot server if already not
                return promise_boot();
            }
            return DEFAULT_STATE;
        }
    );
}

// promise to quit server
function promise_quit() {
    return new Promise(function(resolve, reject) {
        server.send('/node/supercollider', ['boot', 0]);
        check_for_promise(resolve, reject, "quit timeout!", 3000);
    });
}

// promise to start/stop record
function promise_record(value) {
    return new Promise(function(resolve, reject) {
        server.send('/node/supercollider', ['record', value]);
        check_for_promise(resolve, reject, "record timeout!", 2000);
    });
}

function handle_ok(callback) {
    return function(state) {
        server_state = state;
        if(callback) callback(state);
    };
}

function handle_error(callback, msg) {
    return function(error){
        server_state = DEFAULT_STATE;
        if(callback) callback(server_state);
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
    if(server_state.boot) {
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
    if(server_state.mute) {
        mute(0, callback);
    } else {
        mute(1, callback);
    }
}

function quit(callback) {
    // 1. know sc state
    promise_state()
    .then(function(state) {  // 2. try to stop record (if started)
        return promise_record(0);
    })
    .then(function(state) {  // 3. quit sc
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
        function(state) { return promise_record(1); }
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
            if(state.record) { return promise_record(0); }
            else { return state; }
        }
    )
    .then(
        handle_ok(callback),
        handle_error(callback)
    );
}

function record(value, callback) {
    if(value) record_start(callback);
    else record_stop(callback);
}


function record_toggle(callback) {
    if(server_state.record) {
        record_stop(callback);
    }
    else {
        recort_start(callback);
    }
}

function volume(v) {
    server.send('/node/supercollider', ['volume', v]);
}

function stop_all() {
    server.send('/node/supercollider', ['stop_all']);
}

function free_all() {
    server.send('/node/supercollider', ['free_all']);
}

// on loads binds to socket "state" message
init_socket_io();

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
