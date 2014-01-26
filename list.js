M.wrap('github/jillix/list/v0.0.1/list.js', function (require, module, exports) {

var Bind = require('github/jillix/bind/v0.0.1/bind');

function init () {
    var self = this;
    config = self.mono.config.data;
    
    // init bind
    Bind(self).load(config.bind, function (err, bind) {
        
        if (err) {
            // TODO do something on error
            return;
        }
        
        // TEST NAVIGATION
        if (self.mono.miid === 'navigation') {
            bind.view.on.done = function (view) {
                var elms = bind.view.dom.querySelectorAll('li');
                elms[0].addEventListener('click', function () {
                    bind.state.set('/editor');
                }, false);
                elms[1].addEventListener('click', function () {
                    bind.state.set('/list');
                }, false);
                elms[2].addEventListener('click', function () {
                    bind.state.set('/list');
                }, false);
                elms[3].addEventListener('click', function () {
                    bind.state.set('/list');
                }, false);
                elms[4].addEventListener('click', function () {
                    bind.state.set('/list');
                }, false);
            };
        }
        
        // save bind instance
        self.bind = bind;
        
        // set an empty state is the same like: state.set(location.pathname);
        bind.view.render();
        self.emit('ready');
    });
}

module.exports = init;

return module;

});
