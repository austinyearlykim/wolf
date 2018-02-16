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
    console.log(this.symbol.meta.minPrice);
}

*/

module.exports = class Symbol {
    constructor(config) {
        this.tradingPair = config.tradingPair;
        this.meta = {};
    }

    async init() {
        try {
            const exchangeInfo = await binance.exchangeInfo();
            exchangeInfo.symbols.forEach((symbol) => {
                if (symbol.symbol === this.tradingPair) {
                    this.meta = Object.assign(this.getters(), symbol);
                }
            });
            return true;
        } catch(err) {
            return false;
        }
    }

    getters() {
        return {
            get minPrice() { return Number(this.filters[0].minPrice) },
            get maxPrice() { return Number(this.filters[0].maxPrice) },
            get tickSize() { return Number(this.filters[0].tickSize) },
            get minQty() { return Number(this.filters[1].minQty) },
            get maxQty() { return Number(this.filters[1].maxQty) },
            get stepSize() { return Number(this.filters[1].stepSize) },
            get sigFig() { return Number(this.filters[0].minPrice.indexOf('1') - 2) }
        }
    }
};
