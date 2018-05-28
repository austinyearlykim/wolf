const binance = require('./binance.js');
/*

<--- Wolf.js --->

const Ticker = require('./Ticker.js');

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
        this.meta = {};
        this.isDev = process.env.NODE_ENV === 'dev';
        this.godMode = {
            bid: !this.isDev ? false : '0.01100000',
            ask: !this.isDev ? false : '0.01000000'
        };
    }

    init() {
        return new Promise((resolve, reject) => {
            try {
                binance.ws.partialDepth({ symbol: this.tradingPair, level: 5 }, (depth) => {
                    const temp = {
                        bidPrice: this.godMode.bid || depth.bids[0].price,
                        askPrice: this.godMode.ask || depth.asks[0].price
                    };
                    this.meta = Object.assign(this.getters(), temp);
                    this.callbacks.forEach((cb) => cb());
                    resolve(true);
                });
            } catch(err) {
                reject(false);
            }
        });
    }

    getters() {
        return {
            get bid() { return Number(this.bidPrice) },
            get ask() { return Number(this.askPrice) }
        }
    }
}
