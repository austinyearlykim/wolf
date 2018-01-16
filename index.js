require('dotenv').config();
const binance = require('./modules/binance.js');
const twilio = require('./modules/twilio.js');

const TRADING_PAIR = process.env.TRADING_PAIR;
const PERCENTAGE = Number(process.env.PROFIT_PERCENTAGE)/100;

const budget = (Number(process.env.BUDGET)).toFixed(8);
const fee = (budget * .001).toFixed(8);
const netBudget = budget - fee;

let unconfirmedPurchase;
let confirmingPurchase = false;
let confirmedPurchase;

let fudding = false;

let unconfirmedSell;
let confirmingSell = false;
let confirmedSell;

let master;
let webSocket;

function setupWebSocket() {
    webSocket = binance.ws.partialDepth({ symbol: TRADING_PAIR, level: 5 }, (depth) => {
        const temp = {};
        temp.optimalBuyPrice = (Number(depth.bids[0].price) + 0.00000100).toFixed(8);
        temp.optimalAskPrice = (Number(depth.asks[0].price) - 0.00000100).toFixed(8);
        temp.difference = (temp.optimalAskPrice - temp.optimalBuyPrice).toFixed(8);
        master = temp;
    });
}

function calculateQuantityBasedOnBudget(price) {
    let quantity = 0;
    while (quantity * price <= netBudget) {
        quantity += .0001;
    };
    return quantity.toFixed(3);
}

async function purchase() {
    try {
        const price = master.optimalBuyPrice;
        const quantity = calculateQuantityBasedOnBudget(price);
        unconfirmedPurchase = await binance.order({ symbol: TRADING_PAIR, side: 'BUY', quantity, price });
        console.log('[PURCHASING]:::: ', unconfirmedPurchase.price);
    } catch(e) {
        console.log(e);
        return;
    }
}

async function confirmPurchase() {
    try {
        if (confirmedPurchase) return;
        confirmingPurchase = true;
        const check = await binance.getOrder({ symbol: TRADING_PAIR, orderId: unconfirmedPurchase.orderId });
        if (check.status === 'FILLED') {
            confirmingPurchase = false;
            check.price = Number(check.price).toFixed(8);
            confirmedPurchase = check;
            console.log('[PURCHASED]:::: ', check.price);
        };
        confirmPurchase();
    } catch(e) {
        console.log(e);
        return;
    }
}

function fud() {
    fudding = true;
    const confirmedPrice = confirmedPurchase.price;
    const currentPrice = master.optimalAskPrice;
    const profitGoalReached = (currentPrice >= confirmedPrice + (confirmedPrice * PERCENTAGE));
    if (profitGoalReached) return sell(currentPrice);
    fud();
}

async function sell(cp) {
    try {
        const quantity = confirmedPurchase.origQty;
        unconfirmedSell = await binance.order({ symbol: TRADING_PAIR, side: 'SELL', quantity, price: cp });
        console.log('[SELLING]:::: ', unconfirmedSell.price);
    } catch(e) {
        console.log(e);
        return;
    }
}

async function confirmSell() {
    try {
        if (confirmedSell) return reset();
        confirmingSell = true;
        const check = await binance.getOrder({ symbol: TRADING_PAIR, orderId: unconfirmedSell.orderId });
        if (check.status === 'FILLED') {
            confirmingSell = false;
            check.price = Number(check.price).toFixed(8);
            confirmedSell = check;
            const message = '[SOLD]:::: ' + check.price + ' :::: PROFIT = ' + (Number(check.price) - Number(confirmedPurchase.price)).toFixed(8);
            await twilio.sendText(message);
        };
        confirmSell();
    } catch(e) {
        console.log(e);
        return;
    }
}

function reset() {
    unconfirmedPurchase = null;
    confirmingPurchase = false;
    confirmedPurchase = null;
    fudding = false;
    unconfirmedSell = null;
    confirmingSell = false;
    confirmedSell = null;
}

function log() {
    const confirmedPrice = Number(confirmedPurchase.price);
    const profitMargin = Number(confirmedPrice * PERCENTAGE).toFixed(8);
    const obp = Number(master.optimalBuyPrice)
    console.log('[HODL]:::: '
        + obp + '(current price)'
        + ' - (' + confirmedPrice + '(your price) + ' + profitMargin + '(profit margin)' + ')'
        + ' = '
        + ((Number(profitMargin) + Number(confirmedPrice)) - Number(obp)).toFixed(8)
        + ' to go!'
    );
}

async function hodl() {
    if (!master || !webSocket) return setupWebSocket();
    if (master && !unconfirmedPurchase) purchase();
    if (unconfirmedPurchase && !confirmingPurchase && !confirmedPurchase) confirmPurchase();
    if (master && !fudding && confirmedPurchase) fud();
    if (!confirmingSell && unconfirmedSell) confirmSell();
    if (master.optimalAskPrice && confirmedPurchase) log();
}

const interval = setInterval(hodl, 3000);
