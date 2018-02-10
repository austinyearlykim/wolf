/*

<--- wolf.js --->

const Ticker = require('./modules/Ticker.js');

init() {
    const tickerConfig = {
        tradingPair: this.config.tradingPair,
        callbacks: [
            this.execute,
            this.consume
        ]
    };
    const ticker = new Ticker(tickerConfig);
    this.ticker = ticker.init();
    console.log(this.ticker.bid);
    console.log(this.ticker.ask);
}

*/

module.exports = class Ticker {
    constructor(config) {
        this.tradingPair = config.tradingPair;
        this.callbacks = config.callbacks;
        this.ticker = null;
        this.tick = {};
    }

    init() {
        this.ticker = binance.ws.partialDepth({ symbol: this.tradingPair, level: 5 }, (depth) => {
            const temp = {
                bid: depth.bids[0].price,
                ask: depth.bids[0].price
            };
            this.tick = temp;
            this.callbacks.forEach((cb) => cb(););
        });
    }

    get bid() {
        return Number(this.tick.bid);
    }

    get ask() {
        return Number(this.tick.ask);
    }
}
