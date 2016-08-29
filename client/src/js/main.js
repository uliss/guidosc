var menu = require('./menu.js');
var alerts = require('./alerts.js');
var page = require('./page.js');
var ping = require('./ping.js');
var app_ui = require('./app/app_ui.js');
var app_tone = require('./app/app_tone.js');
var app_timer = require('./app/app_timer.js');
var app_vlabel = require('./app/app_vlabel.js');
var app_latency = require('./app/app_latency.js');
var app_piece = require('./app/app_piece.js');
var touch = require('./touch.js');

var mod = {};
mod.instr = require('./modules/instrument.js');
mod.piano = require('./modules/piano.js');
mod.simpleclick = require('./modules/simpleclick.js');
mod.records = require('./modules/records.js');

page.init();
menu.init();
alerts.init();
ping.start(4000);

window.app_tone_run = app_tone.main;
window.app_timer_run = app_timer.main;
window.app_vlabel_run = app_vlabel.main;
window.app_latency_run = app_latency.main;
window.app_ui_run = app_ui.main;
window.app_piece_run = app_piece.main;
window.app_module = function(name) { return mod[name]; };
