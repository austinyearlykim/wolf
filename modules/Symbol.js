const binance = require('./binance.js');

/*

<--- wolf.js --->

const Symbol = require('./modules/Symbol.js');

init() {
    const symbolConfig = {
        tradingPair: this.config.tradingPair,
    };
    const symbol = new Symbol(symbolConfig);
    this.symbol = await ticker.init();
    console.log(this.symbol.filters[1].minPrice);
    console.log(this.symbol.filters[1].maxPrice);
}

*/

module.exports = class Symbol {
    constructor(config) {
        this.tradingPair = config.tradingPair;
        this.info = null;
    }

    async init() {
        const exchangeInfo = await binance.exchangeInfo();
        exchangeInfo.symbols.forEach((symbol) => {
            if (symbol.symbol === this.tradingPair) return this.info = symbol;
        });
    }
};
