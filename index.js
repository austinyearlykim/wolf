require('dotenv').config();
const Wolf = require('./modules/wolf.js');

const config = {
    tradingPair: process.env.TRADING_PAIR,
    strategy: 'long',
    profitPercentage: null,
    budget: process.env.BUDGET
};
const wolf = new Wolf(config);
