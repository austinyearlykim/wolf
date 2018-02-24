require('dotenv').config();
const Wolf = require('./modules/Wolf.js');

const config = {
    tradingPair: process.env.TRADING_PAIR,
    profitPercentage: process.env.PROFIT_PERCENTAGE,
    budget: process.env.BUDGET
};
const wolf = new Wolf(config);

//this may not be needed anymore: https://stackoverflow.com/a/48337609/5725837
if (process.platform === 'win32') {
  require('readline')
    .createInterface({
      input: process.stdin,
      output: process.stdout
    })
    .on('SIGINT', function() {
      process.emit('SIGINT');
    });
}

process.on('SIGINT', async function() {
    await wolf.kill();
    process.exit(0);
});
