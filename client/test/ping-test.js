var atomus = require('atomus');
var chai = require('chai');
var expect = chai.expect;
var ping = require('../src/js/ping.js');

describe('ping.js test', function() {
    var b;

    before(function() {
        b = atomus()
            .html('<div id="nav_ui_connection_indicator"></div>')
            .external(__dirname + '/../../build/js/jquery.min.js');
    }.bind(this));


    it('ping', function(done) {
        this.timeout(4000);
        b.ready(function(errors, window) {
            $ = this.$;
            ping._test.update_indicator();

            setTimeout(function() {
                var el = $("#nav_ui_connection_indicator");
                expect(el.hasClass('nav_ui_indicator_disconnected')).to.be.true;
                expect(el.hasClass('nav_ui_indicator_connected')).to.be.false;
                done();
            }, 1500);
            //
        });
    });
});
