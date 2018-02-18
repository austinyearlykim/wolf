const Twilio = require('twilio');

/*

<--- Wolf.js --->

const twilio = require('./modules/twilio.js');

twilio.sendText('hello world');

*/

class T {
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

module.exports = twilio = new T({
    accountSid: process.env.TWILIO_ACCOUNT_SID,
    authToken: process.env.TWILIO_AUTH_TOKEN,
    fromNumber: process.env.TWILIO_FROM_NUMBER,
    toNumber: process.env.TWILIO_TO_NUMBER
});
