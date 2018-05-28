const assert = require('assert');
const Ticker = require('../modules/Ticker.js');


describe('Ticker', function() {

    const tradingPair = 'ETHBTC';
    let ticker = null;
    let cb1 = false;
    let cb2 = false;

    it('should be able construct Ticker', (done) => {
        (async() => {
            try {
                const config = {
                    tradingPair,
                    callbacks: [
                        () => { cb1 = true },
                        () => { cb2 = true }
                    ]
                };
                ticker = new Ticker(config);
                assert(ticker);
                assert(ticker.tradingPair = tradingPair);
                done();
            } catch(err) {
                throw new Error(err);
            }
        })();
    });

    it('should be able to initialize Ticker', function(done) {
        this.timeout(3000);
        (async() => {
            try {
                await ticker.init();
                done();
            } catch(err) {
                throw new Error(err);
            }
        })();
    });

    it('should be able to execute array of callbacks', function(done) {
        this.timeout(5000);
        (async() => {
            try {
                setTimeout(() => {
                    assert(cb1 && cb2);
                    done();
                }, 4000);
            } catch(err) {
                throw new Error(err);
            }
        })();
    });

    it('should be able access Ticker meta data', function(done) {
        (async() => {
            try {
                assert(ticker.meta);
                assert(ticker.meta.bid && typeof ticker.meta.bid === 'number');
                assert(ticker.meta.ask && typeof ticker.meta.ask === 'number');
                done();
            } catch(err) {
                throw new Error(err);
            }
        })();
    });

});
