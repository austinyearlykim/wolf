require('dotenv').config();
const assert = require('assert');

before(function(done) {
    //validate binance
    assert(process.env.BINANCE_API_KEY, 'missing BINANCE_API_KEY from .env');
    assert(process.env.BINANCE_API_SECRET, 'missing BINANCE_API_SECRET from .env');
    assert(process.env.BINANCE_API_KEY.length === 64, 'invalid BINANCE_API_KEY from .env, please check for typos');
    assert(process.env.BINANCE_API_SECRET.length === 64, 'invalid BINANCE_API_SECRET from .env, please check for typos');

    //validate budget
    assert(process.env.BUDGET, 'missing BUDGET from .env -----> TIP: BUDGET is in BTC units.');
    assert(typeof Number(process.env.BUDGET) === 'number', 'invalid BUDGET from .env,  BUDGET should be only a number and can be up to the 8th decimal point');

    //validate twilio
    const shouldTestTwilio = process.env.TWILIO_ENABLED === 'true' || process.env.TWILIO_ENABLED === 'TRUE';
    if (shouldTestTwilio) {
        assert(process.env.TWILIO_ACCOUNT_SID, 'missing TWILIO_ACCOUNT_SID from .env');
        assert(process.env.TWILIO_AUTH_TOKEN, 'missing TWILIO_AUTH_TOKEN from .env');
        assert(process.env.TWILIO_FROM_NUMBER, 'missing TWILIO_FROM_NUMBER from .env');
        assert(process.env.TWILIO_TO_NUMBER, 'missing TWILIO_TO_NUMBER from .env');
        assert(process.env.TWILIO_ACCOUNT_SID.length === 34, 'invalid TWILIO_ACCOUNT_SID from .env , check for typos');
        assert(process.env.TWILIO_AUTH_TOKEN.length === 32, 'invalid TWILIO_AUTH_TOKEN from .env, check for typos');
        assert(process.env.TWILIO_FROM_NUMBER.length === 12, 'invalid TWILIO_FROM_NUMBER from .env, check for typos');
        assert(process.env.TWILIO_TO_NUMBER.length === 12, 'invalid TWILIO_TO_NUMBER from .env, check for typos');
    }

    done();
});

after(function(done) {
    process.exit(0);
    done();
})
