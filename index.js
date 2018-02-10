require('dotenv').config();
const Wolf = require('./modules/Wolf.js');

const config = {
    tradingPair: process.env.TRADING_PAIR,
    profitPercentage: process.env.PROFIT_PERCENTAGE,
    budget: process.env.BUDGET
};
const wolf = new Wolf(config);
