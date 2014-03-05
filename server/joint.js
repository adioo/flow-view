var M = process.mono;

function init (config) {
    var self = this;
    
    // load and init custom module
    if (config.module) {
        try {
            (require(M.config.paths.APPLICATION_ROOT + config.module)).call(self, config.config);
        } catch (err) {
            // TODO handle error
            console.log(err);
        }
    }
}

module.exports = init;
