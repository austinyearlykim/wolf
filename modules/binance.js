const Binance = require('binance-api-node');
const binance = Binance.default({
  apiKey: process.env.BINANCE_API_KEY,
  apiSecret: process.env.BINANCE_API_SECRET
});
module.exports = binance;
