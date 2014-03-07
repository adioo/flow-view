var M = process.mono;
var View = require(M.config.paths.MODULE_ROOT + 'github/jillix/view/v0.0.1/server/view');

function init (config) {
    var self = this;
    
    View(this, function (err) {
        self.emit('ready');
    });
}

module.exports = init;
