const fs = require('fs');

/*

<--- Wolf.js --->

const Ledger = require('./Ledger.js');

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
		try {
			if (!this.exists()) fs.appendFileSync(this.file, 'date,pair,side,amount,price,testing\n');
			return true;
		} catch(err) {
			console.log('LEDGER ERROR: ', err.message);
			return false;
		}
	}

	write(date, pair, side, amount, price) {
		const testing = process.env.NODE_ENV === 'dev' ? 'TESTING' : ''
		try {
			if (this.exists()) {
				fs.appendFileSync(this.file, `${date} ${pair} ${side} ${amount} ${price} ${testing}\n`);
			} else {
				fs.appendFileSync(this.file, 'date,pair,side,amount,price,testing\n');
				fs.appendFileSync(this.file, `${date},${pair},${side},${amount},${price},${testing}\n`);
			}
			return true;
		} catch(err) {
			return false
		}
	}
}
