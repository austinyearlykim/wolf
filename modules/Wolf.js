const binance = require('./binance.js');
const Symbol = require('./Symbol.js');
const Ticker = require('./Ticker.js');
const Queue = require('./Queue.js');
const Logger = require('./Logger.js');
const fs = require('fs');
const assert = require('assert');
const ora = require('ora');

module.exports = class Wolf {
    constructor(config) {
        this.config = config;
        this.symbol = null; //meta information about trading pair
        this.ticker = null; //bid/ask prices updated per tick
        this.queue = null; //queue for unfilled transactions
        this.watchlist = { length: 0 }; //orderId --> filledTransactions map; as well as length
        this.logger = null; //terminal logging system w/ dank emojis
        this.state = {
            consuming: false,
            killed: false,
            netSpend: 0,
            paranoid: false,
            profitLockPercentageMet: false, //used for mocha testing
            stopLimitPercentageMet: false,
            get compound() { return this.netSpend <= 0 ? 0 : this.netSpend }
        };
        this.init();
    }

    async init() {
        //setup/start logger
        this.logger = new Logger();
        this.logger.init();

        //get trading pair information
        this.symbol = new Symbol({ tradingPair: this.config.tradingPair });
        await this.symbol.init();

        //setup/start queue
        this.queue = new Queue({ tradingPair: this.config.tradingPair, logger: this.logger });
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

        this.hunt();
    }

    //execute W.O.L.F
    hunt() {
        this.purchase();
    }

    //digest the queue of open buy/sell orders
    async consume() {
        const state = this.state;
        const logger = this.logger;
        if (state.killed) return;
        if (state.consuming) return;

        state.consuming = true;
        logger.status({ queueCount: this.queue.meta.length, watchCount: this.watchlist.length });
        const filledTransactions = await this.queue.digest();

        //populate watchlist with filled BUY orders and compound ALL filled orders if necessary
        for (let orderId in filledTransactions) {
            const txn = filledTransactions[orderId];
            const side = txn.side;
            const price = Number(txn.price);
            this.compound(side, price);
            if (side === 'BUY') this.watchlist[orderId] = txn;
            if (!state.stopLimitPercentageMet && side === 'SELL') this.hunt();
        }

        this.watch();

        logger.status({ queueCount: this.queue.meta.length,  watchCount: this.watchlist.length });
        state.consuming = false;
    }

    //watch for any triggers i.e STOP_LIMIT_PERCENTAGE, PROFIT_LOCK_PERCENTAGE, and repopulate queue accordingly via this.sell()
    watch() {
        const watchlist = this.watchlist;
        this.watchlist.length = Object.keys(watchlist).length - 1;
        this.logger.status({ queueCount: this.queue.meta.length, watchCount: this.watchlist.length });

        const config = this.config;
        const state = this.state;
        for (let orderId in watchlist) {
            const order = watchlist[orderId];
            const orderPrice = Number(order.price);
            const orderQuantity = Number(order.executedQty);
            const currentPrice = this.ticker.meta.bid;
            let shouldSell = false;
            if (currentPrice >= (orderPrice + (orderPrice * config.profitPercentage))) shouldSell = true;                         //PROFIT_PERCENTAGE TRIGGER
            if (state.paranoid && (currentPrice <= orderPrice + (orderPrice * config.profitLockPercentage))) {                    //PROFIT_LOCK TRIGGER
                console.log(' [ALARM]::: Price dipped below PROFIT_LOCK_PERCENTAGE while in paranoid mode. Selling.');
                state.profitLockPercentageMet = true;  //used for mocha testing
                shouldSell = true;
            }
            if (config.profitLockPercentage && (currentPrice >= orderPrice + (orderPrice * config.profitLockPercentage))) {       //PROFIT_LOCK TRIGGER
                console.log(' [ALARM]::: PROFIT_LOCK_PERCENTAGE REACHED. Now in paranoid mode.')
                state.paranoid = true;
            }
            if (config.stopLimitPercentage && (currentPrice <= orderPrice - (orderPrice * config.stopLimitPercentage))) {         //STOP_LIMIT TRIGGER
                console.log(' [ALARM]::: STOP_LIMIT_PERCENTAGE REACHED. Exiting position.');
                state.stopLimitPercentageMet = true;
                shouldSell = true;
            }
            if (shouldSell) {
            	this.sell(orderQuantity, currentPrice);
                state.paranoid = false;
                delete watchlist[orderId];
            }
        }
    }

    //calculate quantity of coin to purchase based on given budget from .env
    calculateQuantity() {
        const logger = this.logger;
        logger.success('Calculating quantity... ');
        const symbol = this.symbol.meta;
        const minQuantity = symbol.minQty;
        const maxQuantity = symbol.maxQty;
        const quantitySigFig = symbol.quantitySigFig;
        const stepSize = symbol.stepSize;  //minimum quantity difference you can trade by
        const currentPrice = this.ticker.meta.ask;
        const budget = this.config.budget + this.state.compound;

        let quantity = minQuantity;
        while (quantity * currentPrice <= budget) quantity += stepSize;
        if (quantity * currentPrice > budget) quantity -= stepSize;
        if (quantity === 0) quantity = minQuantity;

        assert(quantity >= minQuantity && quantity <= maxQuantity, 'invalid quantity');

        logger.success('Quantity Calculated: ' + quantity.toFixed(quantitySigFig));
        return quantity.toFixed(quantitySigFig);
    }

    //push an unfilled limit purchase order to the queue
    async purchase(price) {
        try {
            const symbol = this.symbol.meta;
            const tickSize = symbol.tickSize;  //minimum price difference you can trade by
            const priceSigFig = symbol.priceSigFig;
            const quantitySigFig = symbol.quantitySigFig;
            const buyOrder = {
                symbol: this.config.tradingPair,
                side: 'BUY',
                quantity: this.calculateQuantity(),
                price: (price && price.toFixed(priceSigFig)) || (this.ticker.meta.ask).toFixed(priceSigFig)
            };
            const unconfirmedPurchase = await binance.order(buyOrder);
            this.queue.push(unconfirmedPurchase);
            this.logger.success('Purchasing... ' + unconfirmedPurchase.symbol);
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
            const sellOrder = {
                symbol: this.config.tradingPair,
                side: 'SELL',
                quantity: quantity.toFixed(quantitySigFig),
                price: profit.toFixed(priceSigFig)
            };
            const unconfirmedSell = await binance.order(sellOrder);
            this.queue.push(unconfirmedSell);
            this.logger.success('Selling...' + unconfirmedSell.symbol);
        } catch(err) {
            console.log('SELL ERROR: ', err.message);
            return false;
        }
    }

    compound(side, price) {
        if (!this.config.compound) return;
        if (side === 'BUY') this.state.netSpend -= price;
        if (side === 'SELL') this.state.netSpend += price;
        this.logger.success('Compounding...' + this.state.netSpend);
    }

    async kill() {
        try {
            this.state.killed = true;
            const meta = this.queue.meta;
            const queue = meta.queue;
            const length = meta.length;
            const logger = this.logger;
            let counter = 0;

            logger.success(`Cancelling ${length} open orders created by W.O.L.F`);
            for (let orderId in queue) {
                const orderToCancel = queue[orderId];
                await binance.cancelOrder({
                    symbol: orderToCancel.symbol,
                    orderId: orderToCancel.orderId
                });
                counter++;
            }
            logger.success(`Cancelled ${counter} opened orders created by W.O.L.F`);

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
