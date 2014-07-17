var M = process.mono;

function init (config) {
    var self = this;
    
    // load and init custom module
    if (config.module) {
        try {
            (require(M.config.paths.PROJECT_ROOT + config.module)).call(self, config.config);
        } catch (err) {
            // emit ready with error
            self.emit('ready', err);
        }
    }
}

module.exports = init;
