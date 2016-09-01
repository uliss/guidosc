var fs = require('fs');
var inherits = require('inherits');
var utils = require('./utils');
var mod = require('./module.js');
var log = utils.log('sound');

function Sound(app_global) {
    mod.Module.call(this, app_global, 'sound');

    this.soundDir = __dirname + '/../../build/sound';

    this.addCommand('ls', 'get list of recordings', function() {
        try {
            return fs.readdirSync(this.soundDir).filter(function(f) {
                return f.substr(-4) === '.wav';
            });
        } catch (e) {
            log.error("ls exception:", e.message);
            return [];
        }
    });

    this.addCommand('playlist', 'returns JSON playlist', function(args) {
        try {
            var files = fs.readdirSync(this.soundDir).filter(function(f) {
                return f.substr(-4) === '.wav';
            });

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

            return playlist;
        } catch (e) {
            log.error("playlist:", e.message);
            return [];
        }
    });
}

inherits(Sound, mod.Module);

module.exports = Sound;
module.exports._test = {
    log: log
};
