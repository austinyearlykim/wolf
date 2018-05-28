require('dotenv').config();
const assert = require('assert');

before(function(done) {
    //validate binance
    assert(process.env.BINANCE_API_KEY, 'missing BINANCE_API_KEY from .env');
    assert(process.env.BINANCE_API_SECRET, 'missing BINANCE_API_SECRET from .env');
    assert(process.env.BINANCE_API_KEY.length === 64, 'invalid BINANCE_API_KEY from .env, please check for typos');
    assert(process.env.BINANCE_API_SECRET.length === 64, 'invalid BINANCE_API_SECRET from .env, please check for typos');

    //validate budget
    assert(process.env.BUDGET, 'missing BUDGET from .env');
    assert(typeof Number(process.env.BUDGET) === 'number', 'invalid BUDGET from .env,  BUDGET should be of type number and can be up to the 8th decimal point');

    //validate profit percentage
    assert(process.env.PROFIT_PERCENTAGE, 'missing PROFIT_PERCENTAGE from .env');
    assert(typeof Number(process.env.PROFIT_PERCENTAGE) === 'number', 'invalid PROFIT_PERCENTAGE from .env,  PROFIT_PERCENTAGE should be of type number');

    //validate trading pair
    assert(process.env.TARGET_ASSET && process.env.BASE_ASSET, 'must have both TARGET_ASSET and BASE_ASSET in .env');
    const validBaseAssets = ['BTC', 'ETH', 'BNB', 'USDT'];
    assert(validBaseAssets.some((b, i) => {
        return  process.env.BASE_ASSET === validBaseAssets[i];
    }), 'invalid BASE_ASSET in .env');

    done();
});

after(function(done) {
    done();
});
