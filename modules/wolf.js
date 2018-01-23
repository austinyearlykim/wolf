const binance = require('./binance.js');

module.exports = class Wolf {
    constructor() {
        this.ticker = null;  //binance websocket responsible for updating bid/ask prices per second
        this.tick = null;  //up to date bid/ask prices {bid: 0.12345678, ask: 0.12345678}
        this.transaction = {  //wolf can only do one "complete" transaction at a time. BUY and SELL OR SELL and BUY;  this.transaction will get reset after every successful transaction
            purchasedQuantity: null,
            purchasedPrice: null,
            targetPrice: null,  //(purchasedPrice * .001) + (purchasedPriceNumber * (Number(process.env.PROFIT_PERCENTAGE)/100)) + purchasedPrice
            soldPrice: null
        };
        this.executing = false;
        this.init();
    }

    //initiate ticker
    init() {
        this.ticker = binance.ws.partialDepth({ symbol: process.env.TRADING_PAIR, level: 5 }, (depth) => {
            const temp = {};
            temp.bid = (Number(depth.bids[0].price) + 0.00000100).toFixed(8);
            temp.ask = (Number(depth.asks[0].price) - 0.00000100).toFixed(8);
            this.tick = temp;
            !this.executing && this.execute();
        });
    }

    //execute W.O.L.F
    execute() {
        this.executing = true;
        const interval = setInterval(() => {
            if (false) {
                clearInterval(interval);
            }
            this.logger('Current optimal bid/ask spread: ', this.tick);
        }, 100);
    }

    //calculate quantity of coin to purchase based on given budget from .env
    //this one is tricky because coin minimums per trade vary...  e.g BTC (.001) vs NEO (.01) vs REQ (1)
    calculateQuantity() {
        //return calculated int
    }

    //purchase quantity of coin @ this.tick.ask and only continue executing W.O.L.F if this limit buy order is FILLED.
    async purchase() {
        //calculateQuantity
        //limit buy
        //check if bought
        //check if bought
        //check if bought
            //update this.transaction
            //this.sell();
    }

    //sell quantity of coin @ this.transaction.targetPrice and only continue executing W.O.L.F if this limit sell order is FILLED.
    async sell() {
        //limit sell
        //check if sold
        //check if sold
        //check if sold
            //update this.transaction
            //write to file
            //text mobile device
            //this.executing = false;
    }

/*
    W.O.L.F will execute different strategies dependent on what is passed in .env; future features include smart strategy detection.

    async long(){
        //purchase();
        //sell();
        //repeat();
    }

    async short(){
        //sell();
        //purchase();
        //repeat();
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
