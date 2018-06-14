const ora = require('ora');

/*

<--- Wolf.js --->

const Logger = require('./Logger.js');

init() {
    const logger = new Logger(this.meta);
    this.logger = logger.init();
    logger({queueCount: 1, watchCount: 0});
    logger.success('bought ADA @ 12.2313');
    logger({queueCount: 0, watchCount: 1});
}

*/

module.exports = class Logger {
    constructor(config) {
        this.logger = null;
        this.stats = null;
        this.queueCount = 0;
        this.watchCount = 0;
    }

    init() {
        this.logger = ora({text: 'Initializing...', color: 'green'}).start();
    }

    status(stats) {
        try {
            const newStats = 'Queue: ' + (Number(stats.queueCount) || 0) + ' Watchlist: ' + (Number(stats.watchCount) || 0);
            this.stats = newStats;
            this.logger.text = newStats;
        } catch(err) {
            console.log('LOGGER ERROR: ', err);
            return false;
        }
    }

    success(message) {
        try {
            const logger = this.logger;
            logger.succeed(message);
            logger.start(this.stats);
        } catch(err) {
            console.log('LOGGER ERROR: ', err);
            return false;
        }
    }
};
