var chai = require('chai');
var expect = chai.expect; // we are using the "expect" style of Chai
var utils = require('../src/utils.js');

describe('UtilsTest', function() {
    it('toHHMMSS', function() {
        expect(1 .toHHMMSS()).to.equal('00:00:01');
        expect(59 .toHHMMSS()).to.equal('00:00:59');
        expect(60 .toHHMMSS()).to.equal('00:01:00');
        expect(3599 .toHHMMSS()).to.equal('00:59:59');
        expect(3600 .toHHMMSS()).to.equal('01:00:00');
        expect(36000 .toHHMMSS()).to.equal('10:00:00');
        expect(-1 .toHHMMSS()).to.be.NaN;
        expect(-10 .toHHMMSS()).to.be.NaN;
        expect(1.123 .toHHMMSS()).to.be.NaN;
    });
});
