var fs = require('fs');
var utils = require('./utils.js');
var node_path = utils.node_path;
var cli_path = utils.cli_path;
var soundDir = __dirname + '/../build/sound';

function init() {

}

function is_record(fname) {
    return fname.substr(-5) === '.wav' && fname.substr(3) === "rec";
}

function bindSocket(io, socket) {
    socket.on(node_path("/records/ls"), function() {
        fs.readdir(soundDir, function(err, files) {
            if (files === undefined)
                files = [];

            files.filter(is_record);
            io.to(socket.id).emit(cli_path("/records/ls"), files);
        });
    });

    socket.on(node_path("/records/playlist"), function() {
        fs.readdir(soundDir, function(err, files) {
            if (files === undefined)
                files = [];

            files.filter(is_record);
            files.sort();
            files.reverse();

            var playlist = [];
            files.forEach(function(f) {
                playlist.push({
                    title: f.slice(0, -4),
                    author: 'SuperCollider',
                    url: "/sound/" + f,
                    pic: "/css/cover-default.png"
                });
            });


            io.to(socket.id).emit(cli_path("/records/playlist"), playlist);
        });
    });
}

module.exports.init = init;
module.exports.bindSocket = bindSocket;
