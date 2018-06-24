/*
{ symbol: 'ADAETH',
  orderId: 23520460,
  clientOrderId: 'umgDwvUXdn5cpI99dLDE9W',
  transactTime: 1527451152181,
  price: '0.00034012',
  origQty: '36.00000000',
  executedQty: '0.00000000',
  status: 'NEW',
  timeInForce: 'GTC',
  type: 'LIMIT',
  side: 'BUY' }
*/

require('dotenv').config();

const assert = require('assert');
const binance = require('./modules/binance.js');
const Ticker = require('./modules/Ticker.js');
const Wolf = require('./modules/Wolf.js');

let wolf = {};
let order = {};
let getOrder = {};
const config = {
    tradingPair: 'ADAETH',
    profitPercentage: Number('9')/100,
    budget: Number('.015'),
    compound: 'true',
    profitLockPercentage: Number('5')/100,
    stopLimitPercentage: Number('10')/100,
    buyLimitPercentage: Number('1')/100,
    buyLimitReset: Number('1') //one minute
};

function timeout(ms) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve();
        }, ms)
    })
}

before(function(done) {
    process.env.NODE_ENV = 'dev';
    binance.order = function(params) {
        order = {
            symbol: params.symbol,
            orderId: 23520460,
            clientOrderId: 'someClientId',
            transactTime: 1527451152181,
            price: params.price,
            origQty: params.quantity,
            executedQty: '0.00000000',
            status: 'NEW',
            timeInForce: 'GTC',
            type: 'LIMIT',
            side: params.side
        };
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                resolve(order);
            }, 1000);
        });
    };
    binance.getOrder = function(params) {
        getOrder = {
            symbol: order.symbol,
            orderId: order.orderId,
            clientOrderId: 'GKxUD7DvsGfnhIstRCWMr2',
            price: order.price,
            origQty: order.origQty,
            executedQty: order.origQty,
            status: 'FILLED',
            timeInForce: 'GTC',
            type: 'LIMIT',
            side: order.side,
            stopPrice: '0.00000000',
            icebergQty: '0.00000000',
            time: 1527455241678,
            isWorking: true
        };
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                resolve(getOrder);
            }, 1000);
        });
    };
    done();
});

after(function(done) {
    process.env.NODE_ENV = 'prod';
    done();
});

it('should be able start wolf', function(done) {
    this.timeout(10000000);
    (async() => {
        try {
            wolf = new Wolf(config);
            await timeout(5000);
            done();
        } catch(err) {
            throw new Error(err);
        }
    })();
});

it('should be able to execute buys and sells on an uptrend', function(done) {
    this.timeout(10000000);
    (async() => {
        try {
            await timeout(8000);
            wolf.ticker.godMode.ask = wolf.ticker.godMode.bid;
            wolf.ticker.godMode.bid = Number(wolf.ticker.godMode.ask) + (Number(wolf.ticker.godMode.ask) * Number(config.profitPercentage));
            await timeout(8000);
            wolf.ticker.godMode.ask = wolf.ticker.godMode.bid;
            wolf.ticker.godMode.bid = Number(wolf.ticker.godMode.ask) + (Number(wolf.ticker.godMode.ask) * Number(config.profitPercentage));
            await timeout(8000);
            wolf.ticker.godMode.ask = wolf.ticker.godMode.bid;
            wolf.ticker.godMode.bid = Number(wolf.ticker.godMode.ask) + (Number(wolf.ticker.godMode.ask) * Number(config.profitPercentage));
            await timeout(10000);
            assert(Number(wolf.queue.meta.buyCount) >= 2);
            assert(Number(wolf.queue.meta.sellCount) >= 2);
            done();
        } catch(err) {
            return console.log(err);
        }
    })();
});

it('should be able to execute sell when PROFIT_LOCK_PERCENTAGE is met', function(done) {
    this.timeout(10000000);
    (async() => {
        try {
            wolf.ticker.godMode.bid = Number(wolf.ticker.godMode.ask) + (Number(wolf.ticker.godMode.ask) * Number(config.profitPercentage));
            await timeout(8000);
            wolf.ticker.godMode.bid = Number(wolf.ticker.godMode.bid) - (Number(wolf.ticker.godMode.bid) * Number(config.profitLockPercentage))
            await timeout(8000);
            assert(wolf.state.profitLockPercentageMet);
            done();
        } catch(err) {
            return console.log(err);
        }
    })();
});

it('should be able to create sell order when STOP_LIMIT_PERCENTAGE is met', function(done) {
    this.timeout(10000000);
    (async() => {
        try {
            await timeout(5000);
            wolf.ticker.godMode.bid = '0.00000100';
            await timeout(8000);
            assert(wolf.state.stopLimitPercentageMet);
            done();
        } catch(err) {
            throw new Error(err);
        }
    })();
});
