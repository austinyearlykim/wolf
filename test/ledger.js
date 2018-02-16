const assert = require('assert');
const fs = require('fs');
const Ledger = require('../modules/Ledger.js');


describe('Ledger', function() {
    
    let ledger = null;

    after((done) => {
        fs.unlinkSync(ledger.file);
        done();
    });

    it('should be able construct Ledger', (done) => {
        (async() => {
            try {
                const filename = 'testLedger';
                const config = { filename };
                ledger = new Ledger(config);
                assert(ledger.file === filename + ledger.extension);
                done();
            } catch(err) {
                return console.log(err);
            }
        })();
    });

    it('should create a ledger.csv file if one does not already exist', (done) => {
        (async() => {
            try {
                ledger.init();
                assert(ledger.exists());
                done();
            } catch(err) {
                return console.log(err);
            }
        })();
    });

    it('should be able to write to the ledger', (done) => {
        (async() => {
            try {
                assert(ledger.write(Date.now(), 'ETHBTC', 'BUY', '1.5', '.11839756'));
                done();
            } catch(err) {
                return console.log(err);
            }
        })();
    });

});
