var log = require('./utils.js')('metro');

// visual Metronome
oscServer.on("/sc/vmetro/bar", function(msg, rinfo) {
    log.verbose('bar = "%s"', msg[1]);
    io.emit("/vmetro/bar", msg[1]);
});

oscServer.on("/sc/vmetro/numBeats", function(msg, rinfo) {
    log.verbose('num beats: %s', msg[1]);
    io.emit("/vmetro/numBeats", msg[1]);
});

oscServer.on("/sc/vmetro/beat", function(msg, rinfo) {
    log.verbose('beats:', [msg[1], msg[2]]);
    io.emit("/vmetro/beat", [msg[1], msg[2]]);
});

oscServer.on("/sc/vmetro/mark", function(msg, rinfo) {
    log.verbose('mark:', msg[1]);
    io.emit("/vmetro/mark", msg[1]);
});
