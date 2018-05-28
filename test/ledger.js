const assert = require('assert');
const fs = require('fs');
const Ledger = require('../modules/Ledger.js');


describe('Ledger', function() {
    const filename = 'testLedger';
    let ledger = null;

    after((done) => {
        fs.unlinkSync(ledger.file);
        done();
    });

    it('should be able construct Ledger', (done) => {
        (async() => {
            try {
                const config = { filename };
                ledger = new Ledger(config);
                assert(ledger.file === filename + ledger.extension);
                done();
            } catch(err) {
                throw new Error(err);
            }
        })();
    });

    it('should create a ' + filename + '.csv file if one does not already exist', (done) => {
        (async() => {
            try {
                assert(ledger.init());
                assert(ledger.exists());
                done();
            } catch(err) {
                throw new Error(err);
            }
        })();
    });

    it('should be able to write to the Ledger', (done) => {
        (async() => {
            try {
                assert(ledger.write(Date.now(), 'ETHBTC', 'BUY', '1.5', '.11839756'));
                done();
            } catch(err) {
                throw new Error(err);
            }
        })();
    });

});
