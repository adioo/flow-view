var M = process.mono;

function init (config) {
    var self = this;
    
    // load and init custom module
    if (config.module) {
        try {
            (require(M.paths.APPLICATION_ROOT + module)).call(self, config.config);
        } catch (err) {
            // TODO handle error
        }
    }
}

module.exports = init;
