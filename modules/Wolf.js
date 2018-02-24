const binance = require('./binance.js');
const Symbol = require('./Symbol.js');
const Ticker = require('./Ticker.js');
const Queue = require('./Queue.js');
const fs = require('fs');
const assert = require('assert');

module.exports = class Wolf {
    constructor(config) {
        this.config = config;
        this.symbol = null; //meta information about trading pair
        this.ticker = null; //bid/ask prices updated per tick
        this.queue = null; //queue for unfilled transactions
        this.state = {
            consuming: false,
            killed: false
        };
        this.init();
    }

    async init() {
        //.env stringifies its values.  we convert these strings into numbers here so we don't have to later.
        this.config.budget = Number(this.config.budget);
        this.config.profitPercentage = Number(this.config.profitPercentage)/100;

        //get trading pair information
        this.symbol = new Symbol({ tradingPair: this.config.tradingPair });
        await this.symbol.init();

        //setup/start queue
        this.queue = new Queue({ tradingPair: this.config.tradingPair });
        this.queue.init();

        //setup/start ticker
        const tickerConfig = {
            tradingPair: this.config.tradingPair,
            callbacks: [
                () => this.consume()
            ]
        };
        this.ticker = new Ticker(tickerConfig);
        await this.ticker.init();

        this.execute();
    }

    //execute W.O.L.F
    execute() {
        console.log('Executing W.O.L.F...');
        this.purchase();
    }

    //digest the queue of open buy/sell orders
    async consume() {
        if (this.state.killed) return;
        if (this.state.consuming) return;
        if (!this.queue.meta.length) return;

        this.state.consuming = true;
        console.log('Consuming queue...', 'Orders in queue: ' + this.queue.meta.length);

        const filledTransactions = await this.queue.digest();

        //repopulate queue with closing (unconfirmed) transactions
        for (let orderId in filledTransactions) {
            const txn = filledTransactions[orderId];
            const price = Number(txn.price);
            if (txn.side === 'BUY') {
                const profit = price + (price * this.config.profitPercentage) + (price * .001);
                this.sell(Number(txn.executedQty), profit);
            }
            if (txn.side === 'SELL') {
                const profit = price - (price * this.config.profitPercentage) - (price * .001);
                this.purchase(Number(txn.executedQty), profit);
            }
        }

        console.log('Consumed queue.', 'Orders in queue: ' + this.queue.meta.length);
        this.state.consuming = false;
    }

    //calculate quantity of coin to purchase based on given budget from .env
    calculateQuantity() {
        console.log('Calculating quantity... ');
        const symbol = this.symbol.meta;
        const minQuantity = symbol.minQty;
        const maxQuantity = symbol.maxQty;
        const quantitySigFig = symbol.quantitySigFig;
        const stepSize = symbol.stepSize;  //minimum quantity difference you can trade by
        const currentPrice = this.ticker.meta.bid;
        const budget = this.config.budget;

        let quantity = minQuantity;
        while (quantity * currentPrice <= budget) quantity += stepSize;
        if (quantity * currentPrice > budget) quantity -= stepSize;
        if (quantity === 0) quantity = minQuantity;

        assert(quantity >= minQuantity && quantity <= maxQuantity, 'invalid quantity');

        console.log('Quantity Calculated: ', quantity.toFixed(quantitySigFig));
        return quantity.toFixed(quantitySigFig);
    }

    //push an unfilled limit purchase order to the queue
    async purchase(quantity, price) {
        try {
            const symbol = this.symbol.meta;
            const tickSize = symbol.tickSize;  //minimum price difference you can trade by
            const priceSigFig = symbol.priceSigFig;
            const quantitySigFig = symbol.quantitySigFig;
            const unconfirmedPurchase = await binance.order({
                symbol: this.config.tradingPair,
                side: 'BUY',
                quantity: (quantity && quantity.toFixed(quantitySigFig)) || this.calculateQuantity(),
                price: (price && price.toFixed(priceSigFig)) || (this.ticker.meta.bid + tickSize).toFixed(priceSigFig)
            });
            this.queue.push(unconfirmedPurchase);
            console.log('Purchasing... ', unconfirmedPurchase.symbol);
        } catch(err) {
            console.log('PURCHASE ERROR: ', err);
            return false;
        }
    }

    //push an unfilled limit sell order to the queue
    async sell(quantity, profit) {
        try {
            const symbol = this.symbol.meta;
            const tickSize = symbol.tickSize;  //minimum price difference you can trade by
            const priceSigFig = symbol.priceSigFig;
            const quantitySigFig = symbol.quantitySigFig;
            const unconfirmedSell = await binance.order({
                symbol: this.config.tradingPair,
                side: 'SELL',
                quantity: quantity.toFixed(quantitySigFig),
                price: profit.toFixed(priceSigFig)
            });
            this.queue.push(unconfirmedSell);
            console.log('Selling...', unconfirmedSell.symbol);
        } catch(err) {
            console.log('SELL ERROR: ', err.message);
            return false;
        }
    }

    async kill() {
        try {
            this.state.killed = true;
            const meta = this.queue.meta;
            const queue = meta.queue;
            const length = meta.length;
            let counter = 0;

            console.log(`Cancelling ${length} open orders created by W.O.L.F`);
            for (let orderId in queue) {
                const orderToCancel = queue[orderId];
                await binance.cancelOrder({
                    symbol: orderToCancel.symbol,
                    orderId: orderToCancel.orderId
                });
                counter++;
            }
            console.log(`Cancelled ${counter} opened orders created by W.O.L.F`);

            return true;
        } catch(err) {
            //disregard UNKNOWN_ORDER because the order was executed already; hakuna matata~
            if (err.message === 'UNKNOWN_ORDER') {
                return false;
            }
            console.log('KILL ERROR: ', err.message);
            return false;
        }
    }

};
