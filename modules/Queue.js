const binance = require('./binance.js');
const twilio = require('./twilio.js');
const assert = require('assert');

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
        this.state = config.state;  //CHECK SYNTAX
        this.meta = {
            queue: {}
        };
    }

    init() {
        this.meta = Object.assign(this.meta, this.getters());
    }

    push(txn) {
        try {
            this.validateTransaction(txn);
            this.meta.queue[txn.orderId] = txn;
        } catch(err) {
            console.log('QUEUE ERROR: ', err);
            return null;
        }
    }

    validateTransaction(txn) {
        assert(txn._KEY);
    }

    async digest() {
        const queue = this.meta.queue;
        const filledTxns = {};
        for (let orderId in queue) {
            try {
                const unfilledTxn = queue[orderId];
                const txn = await binance.getOrder({ symbol: this.config.tradingPair, orderId: unfilledTxn.orderId });
                if (txn.status === 'FILLED') {
                    filledTxns[txn.orderId] = txn;
                    const side = txn.side === 'BUY' ? 'PURCHASED' : 'SOLD';
                    console.log(side + ': ' + txn.executedQty + txn.symbol + ' @ ', txn.price)
                    // this.writeToLedger(Date.now(), transaction.symbol, transaction.side, transaction.executedQty, transaction.price);
                    if (txn.side === 'SELL') {
                        // await twilio.sendText(`${side} ${txn.symbol}`);
                        this.state.executing = false;
                    }
                }
            } catch(err) {
                console.log('QUEUE ERROR: ', err);
                return null;
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
