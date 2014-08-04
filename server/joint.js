var env = process.env;

function init (config, ready) {
    var self = this;

    // load and init custom module
    if (config.module) {
        try {
            (require(env.Z_PATH_PROCESS_REPO + config.module)).call(self, config, ready);
        } catch (err) {
            ready(err);
        }
    } else {
        ready();
    }
}

module.exports = init;
