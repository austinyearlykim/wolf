const binance = require('./binance.js');
const twilio = require('./twilio.js');
const assert = require('assert');
const Ledger = require('./Ledger.js');

/*

<--- wolf.js --->

const Queue = require('./modules/Queue.js');

init() {
    const queue = new Queue({ tradingPair: this.config.tradingPair });
    this.queue = queue.init();
    queue.push();
    await queue.digest();
    console.log(this.queue.length);
}

*/

module.exports = class Queue {
    constructor(config) {
        this.tradingPair = config.tradingPair;
        this.state = config.state;
        this.ledger = null;
        this.meta = {
            queue: {}
        };
    }

    init() {
        this.meta = Object.assign(this.getters(), this.meta);
        const ledger = new Ledger({ filename: 'ledger' });
        this.ledger = ledger.init();
    }

    push(txn) {
        try {
            this.validateTransaction(txn);
            this.meta.queue[txn.orderId] = txn;
            return true;
        } catch(err) {
            console.log('QUEUE ERROR: ', err);
            return false;
        }
    }

    validateTransaction(txn) {
        try {
            assert(txn.symbol);
            assert(txn.orderId);
            assert(txn.clientOrderId);
            assert(txn.transactTime);
            assert(txn.price);
            assert(txn.origQty);
            assert(txn.executedQty);
            assert(txn.status);
            assert(txn.timeInForce);
            assert(txn.type);
            assert(txn.side);
            return true;
        } catch(err) {
            return false
        }
    }

    async digest() {
        const queue = this.meta.queue;
        const filledTxns = {};
        for (let orderId in queue) {
            try {
                const unfilledTxn = queue[orderId];
                const txn = await binance.getOrder({ symbol: this.tradingPair, orderId: unfilledTxn.orderId });
                if (txn.status === 'FILLED') {
                    filledTxns[txn.orderId] = txn;
                    const side = txn.side === 'BUY' ? 'PURCHASED' : 'SOLD';
                    console.log(side + ': ' + txn.executedQty + txn.symbol + ' @ ', txn.price)
                    this.ledger.write(Date.now(), txn.symbol, txn.side, txn.executedQty, txn.price);
                    if (txn.side === 'SELL') {
                        await twilio.sendText(`${side} ${txn.symbol}`);
                        this.state.executing = false;
                    }
                }
                return true;
            } catch(err) {
                console.log('QUEUE ERROR: ', err.message);
                return false;
            }
        }
        Object.keys(filledTxns).forEach((orderId) => {
            if (queue[orderId]) delete queue[orderId];
        });
        return filledTxns;
    }

    getters() {
        return {
            get length() { return Object.keys(this.queue).length }
        }
    }
};
