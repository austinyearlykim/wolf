const Twilio = require('twilio');
if (process.env.TWILIO_ENABLED === 'true' || process.env.TWILIO_ENABLED === 'TRUE') {
    const twilio = new Twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
}
module.exports = T = {};

T.sendText = function(message) {
    if (process.env.TWILIO_ENABLED !== 'true' || process.env.TWILIO_ENABLED !== 'TRUE') return;
    return new Promise((resolve, reject) => {
        const config = { body: message, to: process.env.TWILIO_TO_NUMBER, from: process.env.TWILIO_FROM_NUMBER };
        twilio.messages.create(config)
            .then((message) => { resolve(true); })
            .catch((err) => { reject(false); })
    });
};
