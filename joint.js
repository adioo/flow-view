M.wrap('github/jillix/joint/v0.0.1/joint.js', function (require, module, exports) {

function init () {
    var self = this;
    
    var config = self.mono.config.data;
    var module = M.path(config.module);
    
    if (typeof module === 'function') {
        module.call(self, config.config);
    }
}

module.exports = init;

return module;

});
