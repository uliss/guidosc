var expect = chai.expect;

describe("pow", function() {

    it("возводит в n-ю степень", function() {
        expect(pow(2, 3)).to.be.equal(8);
    });
});
