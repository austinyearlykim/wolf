const assert = require('assert');
const Symbol = require('../modules/Symbol.js');


describe('Symbol', function() {

    let symbol = null;

    it('should be able construct Symbol', (done) => {
        (async() => {
            try {
                const config = { tradingPair: 'ETHBTC' };
                symbol = new Symbol(config);
                assert(symbol);
                done();
            } catch(err) {
                throw new Error(err);
            }
        })();
    });

    it('should be initialize Symbol', (done) => {
        (async() => {
            try {
                assert(await symbol.init());
                done();
            } catch(err) {
                throw new Error(err);
            }
        })();
    });

    it('should be able access Symbol meta data', function(done) {
        this.timeout(3500);
        (async() => {
            try {
                setTimeout(() => {
                    assert(symbol.meta);
                    assert(typeof symbol.meta.minPrice === 'number');
                    assert(typeof symbol.meta.maxPrice === 'number');
                    assert(typeof symbol.meta.tickSize === 'number');
                    assert(typeof symbol.meta.minQty === 'number');
                    assert(typeof symbol.meta.maxQty === 'number');
                    assert(typeof symbol.meta.stepSize === 'number');
                    assert(typeof symbol.meta.priceSigFig === 'number');
                    assert(typeof symbol.meta.quantitySigFig === 'number');
                    done();
                }, 3000);
            } catch(err) {
                throw new Error(err);
            }
        })();
    });

});
