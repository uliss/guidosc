var atomus = require('atomus');
var chai = require('chai');
var expect = chai.expect;
var ping = require('../src/js/ping.js');

describe('ping.js test', function() {
    var b;

    before(function() {
        b = atomus()
            .html('<div id="#nav_ui_connection_indicator"></div>')
            .external(__dirname + '/../../build/js/jquery.min.js');
    }.bind(this));


    it('ping', function(done) {
        b.ready(function(errors, window) {
            $ = this.$;
            ping.pingStart();
            var el = $("div");
            expect(el).to.be.not.empty;
            expect(el.length).to.be.above(0);
            expect(el.attr('id')).to.be.equal('#nav_ui_connection_indicator');
            done();
        });
    });
});
