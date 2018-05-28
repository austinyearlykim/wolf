const assert = require('assert');
const Queue = require('../modules/Queue.js');

describe('Queue', function() {
    const tradingPair = 'ETHBTC';
    let queue = null;

    it('should be able construct Queue', (done) => {
        (async() => {
            try {
                const config = { tradingPair };
                queue = new Queue(config);
                assert(queue);
                done();
            } catch(err) {
                throw new Error(err);
            }
        })();
    });

    it('should be initialize Queue', (done) => {
        (async() => {
            try {
                await queue.init();
                done();
            } catch(err) {
                throw new Error(err);
            }
        })();
    });

    it('should be able access Queue meta data', function(done) {
        (async() => {
            try {
                assert(queue.meta);
                assert(typeof queue.meta.length === 'number');
                done();
            } catch(err) {
                throw new Error(err);
            }
        })();
    });

    it('should be able validate valid transactions', function(done) {
        (async() => {
            try {
                const transaction = {
                    symbol: 'ETHBTC',
                    orderId: 1740797,
                    clientOrderId: '1XZTVBTGS4K1e',
                    transactTime: 1514418413947,
                    price: '0.00020000',
                    origQty: '100.00000000',
                    executedQty: '0.00000000',
                    status: 'NEW',
                    timeInForce: 'GTC',
                    type: 'LIMIT',
                    side: 'BUY'
                };
                assert(queue.validateTransaction(transaction));
                done();
            } catch(err) {
                throw new Error(err);
            }
        })();
    });

    it('should be able reject invalid transactions', function(done) {
        (async() => {
            try {
                const invalidTransaction = {
                    symbol: 'ETHBTC',
                    orderasdfId: 1740797,
                    clientOrderId: '1XZTVBTGS4K1e',
                    transasdfactTime: 1514418413947,
                    price: '0.00020000',
                    oriasdfgQty: '100.00000000',
                    executedQty: '0.00000000',
                    staasdftus: 'NEW',
                    timeInForce: 'GTC',
                    typasdfe: 'LIMIT',
                    side: 'BUY'
                };
                assert.equal(queue.validateTransaction(invalidTransaction), false);
                done();
            } catch(err) {
                throw new Error(err);
            }
        })();
    });

    it('should be able add to queue', function(done) {
        (async() => {
            try {
                const transaction = {
                    symbol: 'ETHBTC',
                    orderId: 1740797,
                    clientOrderId: '1XZTVBTGS4K1e',
                    transactTime: 1514418413947,
                    price: '0.00020000',
                    origQty: '100.00000000',
                    executedQty: '0.00000000',
                    status: 'NEW',
                    timeInForce: 'GTC',
                    type: 'LIMIT',
                    side: 'BUY'
                };
                assert(queue.push(transaction));
                assert(queue.meta.length === 1);
                done();
            } catch(err) {
                throw new Error(err);
            }
        })();
    });

});
