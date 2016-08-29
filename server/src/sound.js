var fs = require('fs');
var inherits = require('inherits');
var utils = require('./utils');
var mod = require('./module.js');
var log = utils.log('sound');

const SOUND_DIR = __dirname + '/../../build/sound';

function Sound(app_global) {
    mod.Module.call(this, app_global, 'sound');

    this.addCommand('ls', 'get list of recordings', function() {
        try {
            var files = fs.readdirSync(SOUND_DIR);
            if (!files) files = [];

            return files.filter(function(f) {
                return f.substr(-4) === '.wav';
            });
        } catch (e) {
            log.error("ls exception:", e.message);
            return [];
        }
    });

    this.addCommand('playlist', 'returns JSON playlist', function(args) {
        try {
            var files = fs.readdirSync(SOUND_DIR);
            if (files === undefined)
                files = [];

            files = files.filter(function(f) {
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

            return JSON.stringify(playlist);
        } catch (e) {
            log.error("playlist:", e.message);
            return {};
        }
    });
}

inherits(Sound, mod.Module);

module.exports = Sound;
