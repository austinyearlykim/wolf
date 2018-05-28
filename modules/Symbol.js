const binance = require('./binance.js');

/*

<--- Wolf.js --->

const Symbol = require('./Symbol.js');

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
                    return this.meta = Object.assign(this.getters(), symbol);
                }
            });
            return true;
        } catch(err) {
            console.log('SYMBOL ERROR: ', err.message);
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
            get priceSigFig() { return Number(this.filters[0].tickSize.indexOf('1') - 1) },
            get quantitySigFig() {
                const sf = Number(this.filters[1].stepSize.indexOf('1') - 1);
                return sf >= 0 ? sf : 0;
            }
        }
    }
};
