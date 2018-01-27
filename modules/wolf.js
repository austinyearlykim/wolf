const binance = require('./binance.js');
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
        this.logger('Executing...', '');
        this.executing = true;
        this.purchase();
    }

    //digest the queue of open buy/sell orders
    async consume() {
        this.logger('Consuming queue...', 'Orders in queue: ' + this.queue.length);
        if (!this.queue.length) return;
        this.consuming = true;

        //iterate through queue and hold in memory FILLED transactions
        const filledTransactions = {};
        for (let i = 0; i < this.queue.length; i++) {
            const txn = this.queue[i];
            const transaction = await binance.getOrder({ symbol: this.config.tradingPair, orderId: txn.orderId });
            if (transaction.status === 'FILLED') {
                filledTransactions[txn.orderId] = transaction;
                const side = transaction.side === 'BUY' ? 'PURCHASED' : 'SOLD';
                this.logger(side + ': ' + transaction.executedQty + transaction.symbol + ' @ ', transaction.price);
                this.writeToLedger(Date.now(), transaction.symbol, transaction.side, transaction.executedQty, transaction.price);
            }
        }
        const orderIds = Object.keys(filledTransactions);

        //filter out all FILLED filledTransactions from queue
        this.queue = this.queue.filter((txn) => {
            return orderIds.indexOf(txn.orderId) === -1;
        });

        //repopulate queue with closing (unconfirmed) transactions
        for (let key in filledTransactions) {
            const txn = filledTransactions[key];
            if (txn.side === 'BUY') {
                const price = Number(txn.price);
                const profit = price + (price * Number(this.config.profitPercentage) + (price * .001));
                this.sell(txn.exectedQty, profit);
            }
            if (txn.side === 'SELL') {
                const price = Number(txn.price);
                const profit = price - (price * Number(this.config.profitPercentage));
                this.purchase(txn.exectedQty, profit);
            }
        }

        this.logger('Consumed queue.', 'Orders in queue: ' + this.queue.length);

        //allows wolf to continue execution after one successful half of a trade
        this.consuming = false;
        this.executing = false;
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
        const tickSize = Number(this.symbol.filters[0].tickSize);  //minimum price difference you can trade by
        const sigFig = (this.symbol.filters[0].minPrice).indexOf('1') - 2;
        const unconfirmedPurchase = await binance.orderTest({ symbol: this.config.tradingPair, side: 'BUY', quantity: (quantity && quantity.toFixed(8)) || this.calculateQuantity(), price: (price && price.toFixed(sigFig)) || (this.tick.bid + tickSize).toFixed(sigFig) });
        this.queue.push(unconfirmedPurchase);
        this.logger('Purchasing...', unconfirmedPurchase.symbol);
    }

    //sell quantity of coin and only continue executing W.O.L.F if this limit sell order is FILLED.
    async sell(quantity, profit) {
        const tickSize = Number(this.symbol.filters[0].tickSize);  //minimum price difference you can trade by
        const sigFig = (this.symbol.filters[0].minPrice).indexOf('1') - 2;
        const unconfirmedSell = await binance.orderTest({ symbol: this.config.tradingPair, side: 'SELL', quantity: quantity.toFixed(8), price: profit.toFixed(sigFig) });
        this.queue.push(unconfirmedSell);
        this.logger('Selling...', unconfirmedSell.symbol);
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
