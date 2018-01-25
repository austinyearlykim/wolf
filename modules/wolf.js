const binance = require('./binance.js');
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
            if (symbol.symbol === this.config.tradingPair) console.log(symbol); return this.symbol = symbol;
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
        console.log('execute')
        if (this.config.strategy === 'long' || this.config.strategy === 'LONG') {
            console.log('long');
            this.purchase();
        }
        if (this.config.strategy === 'short' || this.config.strategy === 'SHORT') {
            console.log('short');
            this.sell(REPLACE_THIS_WITH_QUANTITY);
        }
    }

    //digest the queue of open buy/sell orders
    async consume() {
        console.log('consuming');

        if (!this.queue.length) return;
        this.consuming = true;

        //iterate through queue and hold in memory FILLED transactions
        const transactions = {};
        for (let i = 0; i < this.queue.length; i++) {
            const txn = this.queue[i];
            const transaction = await binance.getOrder({ symbol: this.config.tradingPair, orderId: txn.orderId });
            if (transaction.status === 'FILLED') {
                transactions[txn.orderId] = transaction;
            }
        }
        const orderIds = Object.keys(transactions);

        //filter out all FILLED transactions from queue
        this.queue = this.queue.filter((txn) => {
            return orderIds.indexOf(txn.orderId) === -1;
        });

        //repopulate queue with closing transactions
        for (let key in transactions) {
            const txn = transactions[key];
            if (txn.side === 'BUY') {
                const price = Number(txn.price);
                const profit = price + (price * Number(this.config.profitPercentage));
                this.sell(txn.exectedQty, profit);
            }
            if (txn.side === 'SELL') {
                const price = Number(txn.price);
                const profit = price - (price * Number(this.config.profitPercentage));
                this.purchase(txn.exectedQty, profit);
            }
        }

        //allows wolf to continue execution after one successful half of a trade
        // this.executing = false;
        this.consuming = false;
        console.log('consumed');
    }

    //calculate quantity of coin to purchase based on given budget from .env
    calculateQuantity() {
        const minQuantity = Number(this.symbol.filters[1].minQty);
        const maxQuantity = Number(this.symbol.filters[1].maxQty);
        const stepSize = Number(this.symbol.filters[1].stepSize);  //minimum quantity difference you can trade by
        const currentPrice = this.tick.ask;
        const budget = Number(this.config.budget);

        let quantity = minQuantity; // <-------------------------------------------------------- THIS NEEDS TO BE LOOKED AT AGAIN.. WHY DOES THIS EQUAL ONE?
        console.log('1', minQuantity, this.symbol.filters[1].minQty, this.symbol.filters[1].maxQty) // <-------------------------------------------------------- THIS NEEDS TO BE LOOKED AT AGAIN..
        while (quantity * currentPrice <= budget) quantity += stepSize;  // <-------------------------------------------------------- THIS NEEDS TO BE LOOKED AT AGAIN..
        if (quantity * currentPrice > budget) quantity -= stepSize;
        if (quantity === 0) quantity = minQuantity;
        console.log('QUANTITY: ', quantity);
        assert(quantity >= minQuantity && quantity <= maxQuantity, 'invalid quantity');

        return quantity.toFixed(8);
    }

    //purchase quantity of coin @ this.tick.bid and only continue executing W.O.L.F if this limit buy order is FILLED.
    async purchase(quantity, price) {
        console.log('purchasing');
        const tickSize = Number(this.symbol.filters[0].tickSize);  //minimum price difference you can trade by
        const sigFig = (this.symbol.filters[0].minPrice).indexOf('1') - 2;
        const unconfirmedPurchase = await binance.orderTest({ symbol: this.config.tradingPair, side: 'BUY', quantity: (quantity && quantity.toFixed(8)) || this.calculateQuantity(), price: (price && price.toFixed(sigFig)) || (this.tick.bid + tickSize).toFixed(sigFig) });
        this.queue.push(unconfirmedPurchase);
        console.log('purchase pushed', unconfirmedPurchase);
    }

    //sell quantity of coin and only continue executing W.O.L.F if this limit sell order is FILLED.
    async sell(quantity, profit) {
        console.log('selling');
        const tickSize = Number(this.symbol.filters[0].tickSize);  //minimum price difference you can trade by
        const sigFig = (this.symbol.filters[0].minPrice).indexOf('1') - 2;
        const unconfirmedSell = await binance.orderTest({ symbol: this.config.tradingPair, side: 'SELL', quantity: quantity.toFixed(8), price: profit.toFixed(sigFig) });
        this.queue.push(unconfirmedSell);
        console.log('sell pushed', unconfirmedSell);
    }

    //function to stop W.O.L.F and kill the node process
    terminate() {
        this.logger(' Stopping W.O.L.F... terminating node process. ');
        process.exit(0);
    }

    //utility function to console.log formatted messages
    logger(a, b) {
        if (process.env.LOGGING === 'true' || process.env.LOGGING === 'TRUE') {
            const template = '[WOLF]:::: '
            console.log(template, a, b);
        }
    }

    //function to log profits to a .csv file
    writeToFile() {}
};
