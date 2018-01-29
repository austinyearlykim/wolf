const assert = require('assert');
const twilio = require('../modules/twilio.js');

const shouldTestTwilio = process.env.TWILIO_ENABLED === 'true' || process.env.TWILIO_ENABLED === 'TRUE';

shouldTestTwilio && describe('Twilio', function() {
    it('should be able to text user', (done) => {
        (async() => {
            try {
                assert(await twilio.sendText('If you received this this text it means you are all set to receive SMS notifications of when W.O.L.F executes trades!  Go go go!'), 'text was not sent');
                done();
            } catch(err) {
                return console.log(err);
            }
        })();
    });
});
