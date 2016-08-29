
// visual Metronome
oscServer.on("/sc/vmetro/bar", function(msg, rinfo) {
    postln('bar = "' + msg[1] + '"');
    io.emit("/vmetro/bar", msg[1]);
});

oscServer.on("/sc/vmetro/numBeats", function(msg, rinfo) {
    postln('num beats: ' + msg[1]);
    io.emit("/vmetro/numBeats", msg[1]);
});

oscServer.on("/sc/vmetro/beat", function(msg, rinfo) {
    postln('beats: ' + [msg[1], msg[2]]);
    io.emit("/vmetro/beat", [msg[1], msg[2]]);
});

oscServer.on("/sc/vmetro/mark", function(msg, rinfo) {
    postln('mark: ' + msg[1]);
    io.emit("/vmetro/mark", msg[1]);
});

oscServer.on("/sc/vmetro/css", function(msg, rinfo) {
    postln('metro css: {' + msg[1] + ':' + msg[2] + '}');
    io.emit("/vmetro/css", [msg[1], msg[2]]);
});
