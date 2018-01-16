# Project W.O.L.F
    Binance trading bot for NodeJS.

### What it looks like
![alt text](https://imgur.com/fNKvAOy.png "Proof")

### Proof
![alt text](https://imgur.com/pqjqGrd.png "Proof")

IT IS NOT MY RESPONSIBILITY IF YOU GAIN/LOSE MONEY.  THERE IS NO SUCH THING AS PERFECT SOFTWARE.  PLEASE LOOK THROUGH THE CODEBASE/DOCUMENTATION TO UNDERSTAND THE RISKS YOU ARE TAKING.  

### Setup
1. Create an .env file in your root directory.
2. Copy and paste template.env into .env
3. Fill out required environment variables
---> Sign up for Binance API here if you haven't already: https://www.binance.com/userCenter/createApi.html
4. `npm i`
5. `npm start`

### Documentation
##### `How it works`
W.O.L.F calculates how much to spend based on your budget.  It watches price movements of a particular `TRADING_PAIR` in real-time.  It can only ever have one buy/sell transaction happen at once, therefore you can only lose as much as you budget. And even then it's not really considered a loss because you are still holding the asset W.O.L.F purchased for you.  You can sell that asset yourself at any time.

The synchronous nature of the chain of functions that W.O.L.F executes with the real-time data it watches makes sure that your trades execute as fast AND safe as possible.  And only when it's profitable!  Transaction fees are taken account of!  Easy peasy!

##### `.env`
- Currently the only thoroughly tested `TRADING_PAIR` is `ETHBTC`.
- If `TRADING_PAIR` equals `ETHBTC` it means you're buying and selling Ethereum with Bitcoin.
- `PROFIT_PERCENTAGE` is in whole numbers; e.g `1.2` is one-point-two percent.
- `BUDGET` is the most you're willing to lose.  The unit of this number is the second half of `TRADING_PAIR`; e.g if `TRADING_PAIR`is `ETHBTC` then `BUDGET`is the amount of BTC you're willing to lose.

##### `npm start`
This command runs tests before starting the bot.  It then kicks off a recusive loop of functions that keep track of best BUY/SELL prices updated by the second and executes trades that are favored for you.

##### `Ctrl + C`
Pressing these two keys will kill W.O.L.F.  Pay particular attention to where in the function loop W.O.L.F was killed.  You may need to login to https://www.binance.com/userCenter/openOrders.html to kill off any open orders that W.O.L.F is no longer watching for you; but again, that's only if you didn't kill W.O.L.F right after a `[SOLD]::::` console.log().

Future features will alleviate this user-error prone exit strategy.

##### `[PURCHASING]::::`
Limit Buy Order was PLACED.

##### `[PURCHASED]::::`
Limit Buy Order was FILLED.

##### `[HODL]::::`
You now have a position(the coins W.O.L.F purchased).  W.O.L.F is waiting for an optimal price to sell it at to "pseudo-guarantee" execution of a limit sell order.

##### `[SELLING]::::`
Limit Sell Order was PLACED.

##### `[SOLD]::::`
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
