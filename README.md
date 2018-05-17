# Project W.O.L.F
    Binance trading bot for NodeJS.

IT IS NOT MY RESPONSIBILITY IF YOU GAIN/LOSE MONEY.  THERE IS NO SUCH THING AS PERFECT SOFTWARE.  PLEASE LOOK THROUGH THE CODEBASE/DOCUMENTATION TO UNDERSTAND THE RISKS YOU ARE TAKING.  

### Setup
1. Create an `.env` file in your root directory.
2. Copy and paste `template.env` into `.env`
3. Fill out *required* environment variables
4. `npm test`
5. `npm start`

### Release Notes
`v3.4.0` May XX, 2018
- Adds support for USDT.
- `TRADING_PAIR` in `.env` is now deprecated.  Replaced by `TARGET_ASSET` and `BASE_ASSET`.

`v3.3.0` March 26, 2018
- Adds profit lock feature.
- Adds stop limit feature.

`v3.2.0` March 10, 2018
- Adds release notes to README.md.
- Adds compounding budget feature.

### Documentation
##### `How it works`
W.O.L.F calculates how much to spend *per transaction* based on your `BUDGET`.  It watches price movements of a particular trading pair (`TARGET_ASSET` + `BASE_ASSET`) in real-time and will buy at the current price and sell for a calculated `PROFIT_PERCENTAGE`.

The synchronous nature of W.O.L.F makes sure that your trades execute as fast *and* safe as possible.  And only sells when it's profitable!  Transaction fees are taken account of!  Easy peasy!

Brief technical step-by-step:  
1. Wolf calculates quantity of coin to purchase based of `BUDGET`.
2. Wolf places a limit buy order at *market price*.
3. Wolf populates the *queue* with the *unfilled* limit buy order.
    - The *queue* is as a data store where *unfilled* orders live until they've been *filled*.
    - The *queue* is traversed every tick that's fired from the Binance websocket. *About once a second, or faster.*
4. Once the order is *filled*, Wolf puts the order into the *watchlist*.
    - The *watchlist* is a data store where *filled* orders live until they reach your desired `PROFIT_PERCENTAGE`, or any other *optional* `.env` triggers.
    - The *watchlist* is traversed every tick from the Binance websocket as well.
5. Once your order is ready to be sold, Wolf puts an *unfilled* sell order in the *queue*.
6. Once the *queue* detects that the *unfilled* sell order has been *filled*, Wolf will repeat steps 1-6.

##### `.env`
###### REQUIRED
- `BUDGET` is the most you're willing to spend.  The unit of this number is your `BASE_ASSET`; e.g if your desired trading pair is `ADAETH`, then `BUDGET` is the amount of `ETH` you're willing to spend.
- `PROFIT_PERCENTAGE` is in whole numbers; e.g `1.2` is one-point-two percent.
- `TARGET_ASSET` must be in upper-case; e.g if your desired trading pair is `ADAETH`. Your `TARGET_ASSET` is `ADA`.
- `BASE_ASSET` must be in upper-case; e.g if your desired trading pair is `ADAETH`. Your `BASE_ASSET` is `ETH`.
###### OPTIONAL
- `COMPOUND` can be set to true to have your budget programmatically increase as you profit for more profit potential.
- `PROFIT_LOCK_PERCENTAGE` is in whole numbers; e.g `1.2` is one-point-two percent.  
    - Example: Your `PROFIT_PERCENTAGE` is 5% and your `PROFIT_LOCK_PERCENTAGE` is 3%.  W.O.L.F will wait for your order to sell at 5%, however if it passes 3% at anytime and then dips back to say ~2.7% it will do a market order to *lock* some of your gains.   It's important to note that your sell at your `PROFIT_LOCK_PERCENTAGE` will only trigger if the price passes your `PROFIT_LOCK_PERCENTAGE` then dips backwards, otherwise W.O.L.F will continue watching to see if you reach your, more desirable, `PROFIT_PERCENTAGE`.
- `STOP_LIMIT_PERCENTAGE` is in whole numbers; e.g `1.2` is one-point-two percent.  If at any point the current market price of your position dips below this percentage, W.O.L.F will sell your position at *market price* with a *limit* order.  You can either have a `STOP_LIMIT_PERCENTAGE` or `STOP_LOSS_PERCENTAGE`, but not both.

##### `npm start`
This command runs tests before starting the bot.  It then kicks off a recursive loop of functions that keep track of best BUY/SELL prices updated by the second and executes trades that are favored for you.

##### `Ctrl + C`
Pressing these two keys will terminate W.O.L.F and cancel any open orders that W.O.L.F created.  It will not cancel any open orders you might already have.

### Logs
##### `Purchasing... `
Limit Buy Order was PLACED.

##### `PURCHASED. `
Limit Buy Order was FILLED.

##### `Selling... `
Limit Sell Order was PLACED.

##### `SOLD. `
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
