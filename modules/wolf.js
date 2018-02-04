const binance = require('./binance.js');
const twilio = require('./twilio.js');
const fs = require('fs');
const assert = require('assert');

module.exports = class Wolf {
    constructor(config) {
        this.config = config;
        this.symbol = null;
        this.ticker = null;  //binance websocket responsible for updating bid/ask prices per second
        this.tick = null;  //up to date bid/ask prices {bid: 0.12345678, ask: 0.12345678}
        this.executing = false;
        this.consuming = false;
        this.queue = [];
        this.init();
    }

    //initiate ticker
    async init() {
        //get trading pair information
        const exchangeInfo = await binance.exchangeInfo();
        exchangeInfo.symbols.forEach((symbol) => {
            if (symbol.symbol === this.config.tradingPair) return this.symbol = symbol;
        });
        //setup/start ticker
        this.ticker = binance.ws.partialDepth({ symbol: this.config.tradingPair, level: 5 }, (depth) => {
            const temp = {};
            temp.bid = Number(depth.bids[0].price);
            temp.ask = Number(depth.asks[0].price);
            this.tick = temp;
            !this.executing && this.execute();
            !this.consuming && this.consume();
        });
    }

    //execute W.O.L.F
    execute() {
        this.executing = true;
        this.logger('Executing...', '');
        this.purchase();
    }

    //digest the queue of open buy/sell orders
    async consume() {
        if (!this.queue.length) return;
        this.consuming = true;
        this.logger('Consuming queue...', 'Orders in queue: ' + this.queue.length);

        //iterate through queue and hold in memory FILLED transactions
        const filledTransactions = {};
        for (let i = 0; i < this.queue.length; i++) {
            const txn = this.queue[i];
            let transaction;
            try {
                transaction = await binance.getOrder({ symbol: this.config.tradingPair, orderId: txn.orderId });
            } catch(err) {
                return;
            }
            if (transaction.status === 'FILLED') {
                filledTransactions[txn.orderId] = transaction;
                const side = transaction.side === 'BUY' ? 'PURCHASED' : 'SOLD';
                this.logger(side + ': ' + transaction.executedQty + transaction.symbol + ' @ ', transaction.price);
                this.writeToLedger(Date.now(), transaction.symbol, transaction.side, transaction.executedQty, transaction.price);
                if (transaction.side === 'SELL') {
                    await twilio.sendText(`${side} ${transaction.symbol}`);
                    this.executing = false;
                }
            }
        }
        const orderIds = Object.keys(filledTransactions);

        this.logger('Filtering queue...', this.queue.length);
        //filter out all FILLED filledTransactions from queue
        const filteredQueue = this.queue.filter((txn) => {
            return orderIds.indexOf(String(txn.orderId)) === -1;
        });
        this.queue = filteredQueue;
        this.logger('Filtered queue...', filteredQueue.length);

        //repopulate queue with closing (unconfirmed) transactions
        for (let key in filledTransactions) {
            const txn = filledTransactions[key];
            if (txn.side === 'BUY') {
                const price = Number(txn.price);
                const profit = price + ((price * Number(this.config.profitPercentage)/100) + (price * .001));
                this.sell(Number(txn.executedQty), profit);
            }
            if (txn.side === 'SELL') {
                const price = Number(txn.price);
                const profit = price - (price * Number(this.config.profitPercentage));
                this.purchase(Number(txn.executedQty), profit);
            }
        }

        this.logger('Consumed queue.', 'Orders in queue: ' + this.queue.length);
        this.consuming = false;
    }

    //calculate quantity of coin to purchase based on given budget from .env
    calculateQuantity() {
        this.logger('Calculating quantity...', '');
        const minQuantity = Number(this.symbol.filters[1].minQty);
        const maxQuantity = Number(this.symbol.filters[1].maxQty);
        const stepSize = Number(this.symbol.filters[1].stepSize);  //minimum quantity difference you can trade by
        const currentPrice = this.tick.ask;
        const budget = Number(this.config.budget);

        let quantity = minQuantity;
        while (quantity * currentPrice <= budget) quantity += stepSize;
        if (quantity * currentPrice > budget) quantity -= stepSize;
        if (quantity === 0) quantity = minQuantity;

        assert(quantity >= minQuantity && quantity <= maxQuantity, 'invalid quantity');

        this.logger('Quantity Calculated: ', quantity.toFixed(8));
        return quantity.toFixed(8);
    }

    //purchase quantity of coin @ this.tick.bid and only continue executing W.O.L.F if this limit buy order is FILLED.
    async purchase(quantity, price) {
        try {
            const tickSize = Number(this.symbol.filters[0].tickSize);  //minimum price difference you can trade by
            const sigFig = (this.symbol.filters[0].minPrice).indexOf('1') - 2;
            const unconfirmedPurchase = await binance.order({ symbol: this.config.tradingPair, side: 'BUY', quantity: (quantity && quantity.toFixed(8)) || this.calculateQuantity(), price: (price && price.toFixed(sigFig)) || (this.tick.bid + tickSize).toFixed(sigFig) });
            this.queue.push(unconfirmedPurchase);
            this.logger('Purchasing...', unconfirmedPurchase.symbol);
        } catch(err) {
            return this.logger('PURCHASE ERROR: ', err.message);
        }
    }

    //sell quantity of coin and only continue executing W.O.L.F if this limit sell order is FILLED.
    async sell(quantity, profit) {
        try {
            const tickSize = Number(this.symbol.filters[0].tickSize);  //minimum price difference you can trade by
            const sigFig = (this.symbol.filters[0].minPrice).indexOf('1') - 2;
            const unconfirmedSell = await binance.order({ symbol: this.config.tradingPair, side: 'SELL', quantity: quantity.toFixed(8), price: profit.toFixed(sigFig) });
            this.queue.push(unconfirmedSell);
            this.logger('Selling...', unconfirmedSell.symbol);
        } catch(err) {
            return this.logger('SELL ERROR: ', err.message);
        }
    }

    //function to stop W.O.L.F and kill the node process
    terminate() {
        this.logger('Terminating W.O.L.F...');
        process.exit(0);
    }

    //utility function to console.log formatted messages
    logger(a, b) {
        if (process.env.LOGGING === 'true' || process.env.LOGGING === 'TRUE') {
            console.log(`[WOLF]:::: ${a} ${b}`);
        }
    }

    //function to log profits to a ledger.csv file
    async writeToLedger(date, pair, side, amount, price) {
        fs.appendFileSync('ledger.csv', `${date} ${pair} ${side} ${amount} ${price} \n`);
    }
};
