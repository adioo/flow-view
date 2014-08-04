Z.wrap('github/jillix/joint/v0.0.1/joint.js', function (require, module, exports) {

function init (config, ready) {
    var self = this;

    var module = self._path(config.module, window);

    // init custom module
    if (typeof module === 'function') {
        module.call(self, config, ready);
    } else {
        ready();
    }
}

module.exports = init;

return module;

});
