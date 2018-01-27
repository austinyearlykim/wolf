require('dotenv').config();
const assert = require('assert');
const binance = require('../modules/binance.js');

describe('Binance', function() {
    it('should be able to ping Binance API', (done) => {
        (async() => {
            try {
                const ping = await binance.ping();
                assert(ping, 'unable to ping Binance');
                done();
            } catch(err) {
                return console.log(err);
            }
        })();
    });


    it('should be able to make signed requests', (done) => {
        (async() => {
            try {
                const accountInfo = await binance.accountInfo();
                assert(accountInfo, 'unable to receieve balance');
                done();
            } catch(err) {
                return console.log(err);
            }
        })();
    });

    it('should be authorized to trade', (done) => {
        (async() => {
            try {
                const accountInfo = await binance.accountInfo();
                assert(accountInfo.canTrade, 'not authorized to trade on Binance');
                done();
            } catch(err) {
                return console.log(err);
            }
        })();
    });

    it('should have enough balance to afford budget', (done) => {
        (async() => {
            try {
                const tradingPair = process.env.TRADING_PAIR;
                const baseAsset = tradingPair.substr(tradingPair.length - 3);
                const accountInfo = await binance.accountInfo();
                let validBaseAsset = false;
                accountInfo.balances.forEach((balance, index) => {
                    if (balance.asset === baseAsset) {
                        validBaseAsset = true;
                        assert(accountInfo.balances[index].free >= Number(process.env.BUDGET), 'not enough ' + baseAsset + ' balance in Binance wallet to use W.O.L.F with your budget');
                    }
                });
                assert(validBaseAsset, 'invalid trading pair, make in issue with your trading pair in github here: ')
                assert(accountInfo, 'unable to receive balance');
                assert(accountInfo.balances[0].free >= Number(process.env.BUDGET), 'not enough funds in binance wallet to use W.O.L.F, deposit more ' + baseAsset);
                done();
            } catch(err) {
                return console.log(err);
            }
        })();
    });
});
