# Project W.O.L.F
    Binance trading bot for NodeJS.

IT IS NOT MY RESPONSIBILITY IF YOU GAIN/LOSE MONEY.  THERE IS NO SUCH THING AS PERFECT SOFTWARE.  PLEASE LOOK THROUGH THE CODEBASE/DOCUMENTATION TO UNDERSTAND THE RISKS YOU ARE TAKING.  

### Setup
1. Create an `.env` file in your root directory.
2. Copy and paste `template.env` into `.env`
3. Fill out *required* environment variables
4. `npm test`
5. `npm start`

### Documentation
##### `How it works`
W.O.L.F calculates how much to spend *per transaction* based on your `BUDGET`.  It watches price movements of a particular `TRADING_PAIR` in real-time and will buy at the current price and sell for a calculated `PROFIT_PERCENTAGE`.

The synchronous nature of W.O.L.F makes sure that your trades execute as fast *and* safe as possible.  And only sells when it's profitable!  Transaction fees are taken account of!  Easy peasy!

Brief technical explanation:  There are three parts to W.O.L.F.  There is a `ticker`, `queue`, and `consumer`.  The `ticker` keeps track of current prices in real-time and acts a heartbeat. The `ticker` will try to execute a purchase order every tick if it's not already executing one, as well as firing off the `consumer` if it's not already consuming.  Executed trades get put into a `queue` that holds open, or unfilled, orders in memory.  The `consumer` is responsible for checking if these open orders have been filled, and if so remove them from the queue.  The `consumer` will then add back in the queue the open and unfilled, closing order.  Rinse and repeat.

##### `.env`
- `BUDGET` is the most you're willing to spend.  The unit of this number is the second half of `TRADING_PAIR`; e.g if `TRADING_PAIR`is `ETHBTC` then `BUDGET`is the amount of BTC you're willing to spend.
- `PROFIT_PERCENTAGE` is in whole numbers; e.g `1.2` is one-point-two percent.
- `TRADING_PAIR` must be in upper-case; e.g if `TRADING_PAIR` equals `ETHBTC` it means you're buying and selling Ethereum with Bitcoin.

##### `npm start`
This command runs tests before starting the bot.  It then kicks off a recursive loop of functions that keep track of best BUY/SELL prices updated by the second and executes trades that are favored for you.

##### `Ctrl + C`
Pressing these two keys will terminate W.O.L.F and cancel any open orders that W.O.L.F created.  It will not cancel any open orders you might already have.

### Logs
##### `Purchasing... `
Limit Buy Order was PLACED.

##### `Purchased. `
Limit Buy Order was FILLED.

##### `Selling... `
Limit Sell Order was PLACED.

##### `Sold. `
Limit Sell Order was FILLED.

### Issues?
Open up a ticket here to have a question answered or to report a bug: https://github.com/austinyearlykim/wolf/issues

### Donations
    BTC: 13w2zLgzpEfY8o3QYGzdCP1M6qXN9gwn62
    LTC: LUKLmXd4oMbJr4RdV1K2hYgo6b43RQper6
    ETH: 0x8140fd88fe77907eb96ceb7850751576da214715
Be sure to reach out to me to get listed here after you've made a donation!  No donation is too big or small, but >.001btc to get listed as a supporter!  Successful pull requests get you there too!

### Supporters
 - Chase Reid (@Chase-Reid)
