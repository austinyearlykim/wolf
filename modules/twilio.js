const Twilio = require('twilio');

/*

<--- wolf.js --->

const Twilio = require('./modules/Twilio.js');

twilio.sendText('hello world');

*/

class Twilio {
    constructor(config) {
        try {
            this.config = config;
            this.twilio = new Twilio(this.config.accountSid, this.config.authToken);
            this.enabled = true;
        } catch (err) {
            this.enabled = false;
        }
    }

    sendText(message) {
        if (!this.enabled) return;
        return new Promise((resolve, reject) => {
            const config = { body: message, to: this.config.toNumber, from: this.config.fromNumber };
            this.twilio.messages.create(config)
                .then((message) => { resolve(true); })
                .catch((err) => { reject(false); })
        });
    }
}

module.exports = twilio = new Twilio({
    accountSid: process.env.TWILIO_ACCOUNT_SID,
    authToken: process.env.AUTH_TOKEN,
    fromNumber: process.env.FROM_NUMBER,
    toNumber: process.env.TO_NUMBER
});
