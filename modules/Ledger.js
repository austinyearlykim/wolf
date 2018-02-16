const fs = require('fs');

/*

<--- wolf.js --->

const Ledger = require('./modules/Ledger.js');

init() {
    const ledger = new Ledger({ filename: 'ledger' });
    this.ledger = ledger.init();
    this.ledger.write(Date.now(), transaction.symbol, transaction.side, transaction.executedQty, transaction.price);
}

*/

module.exports = class Ledger {
	constructor(config) {
		this.filename = config.filename;
		this.extension = '.csv';
        this.file = this.filename + this.extension;
	}

    exists() {
        return fs.existsSync(this.file);
    }

	init() {
        if (this.exists()) {
            return;
        } else {
            fs.appendFileSync(this.file, 'date,pair,side,amount,price\n');
        }
	}

	write(date, pair, side, amount, price) {
		try {
			if (this.exists()) {
				fs.appendFileSync(this.file, `${date} ${pair} ${side} ${amount} ${price}\n`);
			} else {
				fs.appendFileSync(this.file, 'date,pair,side,amount,price\n');
				fs.appendFileSync(this.file, `${date},${pair},${side},${amount},${price}\n`);
			}
			return true;
		} catch(err) {
			return false
		}
	}
}
