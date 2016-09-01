var chai = require('chai');
var expect = chai.expect;
var utils = require('../src/js/utils.js');

describe('utils', function() {
    it('add', function() {
        expect(utils.add(2, 3)).to.be.equal(5);
        expect(utils.add(3, 2)).to.be.equal(5);
        expect(utils.add('a', 'b')).to.be.equal('ab');
    });

    it('sum', function() {
        expect(utils.sum([1, 2, 3, 4, 5])).to.be.equal(15);
        expect(utils.sum([])).to.be.equal(0);
    });

    it('average', function() {
        expect(utils.average([1, 2, 3, 4, 5])).to.be.equal(3);
        expect(utils.average([])).to.be.NaN;
    });

    it('random_int', function() {
        for (var i = 0; i < 10; i++)
            expect(utils.random_int(0, 10)).to.be.within(0, 10);

        for (var i = 0; i < 10; i++)
            expect(utils.random_int(-10, 0)).to.be.within(-10, 0);
    });

    it('is_server', function() {
        expect(utils.is_server()).to.be.true;
    });

    it('shadeColor', function() {
        expect(utils.shadeColor('no-color', 0)).to.be.null;
        expect(utils.shadeColor('red', 0)).to.be.equal('#ff0000');
        expect(utils.shadeColor('green', 0)).to.be.equal('#00ff00');
        expect(utils.shadeColor('blue', 0)).to.be.equal('#0000ff');

        expect(utils.shadeColor('red', 0.5)).to.be.equal('#ff8080');
        expect(utils.shadeColor('green', 0.5)).to.be.equal('#80ff80');
        expect(utils.shadeColor('blue', 0.5)).to.be.equal('#8080ff');

        expect(utils.shadeColor('#F00', 0.5)).to.be.equal('#ff8080');
        expect(utils.shadeColor('#0F0', 0.5)).to.be.equal('#80ff80');
        expect(utils.shadeColor('#00F', 0.5)).to.be.equal('#8080ff');

        expect(utils.shadeColor('#FF0000', 0.5)).to.be.equal('#ff8080');
        expect(utils.shadeColor('#00FF00', 0.5)).to.be.equal('#80ff80');
        expect(utils.shadeColor('#0000FF', 0.5)).to.be.equal('#8080ff');

        expect(utils.shadeColor('#DEAD0', 0.5)).to.be.null;
    });
});
