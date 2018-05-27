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
            }, 3000);
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
            }, 2000);
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
    const config = {
        tradingPair: process.env.TARGET_ASSET + process.env.BASE_ASSET,
        profitPercentage: Number(process.env.PROFIT_PERCENTAGE)/100,
        budget: Number(process.env.BUDGET),
        compound: process.env.COMPOUND.toLowerCase() === "true",
        profitLockPercentage: Number(process.env.PROFIT_LOCK_PERCENTAGE),
        stopLimitPercentage: Number(process.env.STOP_LIMIT_PERCENTAGE)
    };
    wolf = new Wolf(config);
    done();
});

it('should be able to execute buys and sells', function(done) {
    this.timeout(10000000);
    (async() => {
        try {
            await timeout(5000);
            wolf.ticker.godMode.bid = '0.00033900';
            await timeout(3000);
            wolf.ticker.godMode.bid = '0.00035000';
            await timeout(3000);
            wolf.ticker.godMode.bid = '0.00037000';
            await timeout(3000);
            wolf.ticker.godMode.bid = '0.00038000';
            await timeout(3000);
            wolf.ticker.godMode.bid = '0.00039000';
            await timeout(3000);
            wolf.ticker.godMode.bid = '0.00040000';
            await timeout(3000)
            wolf.ticker.godMode.bid = '0.00050000';
            await timeout(3000);
            wolf.ticker.godMode.bid = '0.00020000';
            await timeout(5000);
            done();
        } catch(err) {
            return console.log(err.message);
        }
    })();
});
