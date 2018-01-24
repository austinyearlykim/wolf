const binance = require('./binance.js');
const assert = require('assert');

module.exports = class Wolf {
    constructor(config) {
        this.config = config;
        this.symbol = null;
        this.ticker = null;  //binance websocket responsible for updating bid/ask prices per second
        this.tick = null;  //up to date bid/ask prices {bid: 0.12345678, ask: 0.12345678}
        this.transaction = {  //wolf can only do one "complete" transaction at a time. BUY and SELL OR SELL and BUY;  this.transaction will get reset after every successful transaction
            purchasedQuantity: null,
            purchasedPrice: null,
            targetPrice: null,  //(purchasedPrice * .001) + (purchasedPriceNumber * (Number(process.env.PROFIT_PERCENTAGE)/100)) + purchasedPrice
            soldPrice: null
        };
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
        this.logger('executing.', '');
        // this.executing = true;
        // const interval = setInterval(() => {
        //     if (false) {
        //         clearInterval(interval);
        //     }
        //     this.logger('Current optimal bid/ask spread: ', this.tick);
        // }, 100);
    }

    //digest the queue of open buy/sell orders
    consume() {
        this.logger('consuming.', '');
        //this.consuming = true;
    }

    //calculate quantity of coin to purchase based on given budget from .env
    calculateQuantity() {
        const minQuantity = Number(this.symbol.filters[1].minQty);
        const maxQuantity = Number(this.symbol.filters[1].maxQty);
        const stepSize = Number(this.symbol.filters[1].stepSize);  //minimum quantity difference you can trade by
        const minNotional = Number(this.symbol.filters[2].minNotional);  //minimum the trade has to be
        const currentPrice = this.tick.ask;
        const budget = Number(this.config.budget);

        let quantity = minQuantity;
        while (quantity * currentPrice <= budget) quantity += stepSize;
        if (quantity * currentPrice > budget) quantity -= stepSize;

        assert(quantity >= minQuantity && quantity <= maxQuantity, 'invalid quantity');

        return quantity.toFixed(8);
    }

    //purchase quantity of coin @ this.tick.ask and only continue executing W.O.L.F if this limit buy order is FILLED.
    async purchase() {
        //calculateQuantity
        //limit buy (push to queue)
        //check if bought
        //check if bought
        //check if bought
            //update this.transaction
            //this.sell();
    }

    //sell quantity of coin @ this.transaction.targetPrice and only continue executing W.O.L.F if this limit sell order is FILLED.
    async sell() {
        //limit sell (push to queue)
        //check if sold
        //check if sold
        //check if sold
            //update this.transaction
            //write to file
            //text mobile device
    }

/*
    W.O.L.F will execute different strategies dependent on what is passed in .env; future features include smart strategy detection.

    async long(){
        //purchase();
        //sell();
        //repeat();
        //this.executing = false;
    }

    async short(){
        //sell();
        //purchase();
        //repeat();
        //this.executing = false;
    }
*/

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
