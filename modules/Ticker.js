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
        this.meta = {};
    }

    init() {
        this.ticker = binance.ws.partialDepth({ symbol: this.tradingPair, level: 5 }, (depth) => {
            const temp = {
                bidPrice: depth.bids[0].price,
                askPrice: depth.bids[0].price
            };
            this.meta = Object.assign(temp, this.getters());
            this.callbacks.forEach((cb) => cb(););
        });
    }

    getters() {
        return {
            get bid() { return Number(this.bidPrice) },
            get ask() { return Number(this.askPrice) }
        }
    }
}
