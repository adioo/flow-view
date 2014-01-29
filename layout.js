M.wrap('github/jillix/layout/v0.0.1/layout.js', function (require, module, exports) {

var Bind = require('github/jillix/bind/v0.0.1/bind');

// TODO plug a css3 animation library here
function page (config) {
    // set css
    if (config) {
        var bind = this.bind;
        
        for (var selector in config) {
            var elm = document.querySelector(selector);
            if (elm) {
                for (var style in config[selector]) {
                    elm.style[style] = config[selector][style];
                }
            }
        }
    }
}

function init () {
    var self = this;
    
    // state handler to handle css in pages
    self.page = page;
    
    config = self.mono.config.data;
    
    // set document title
    if (config.title) {
        document.title = config.title;
    }
    
    // init bind
    Bind(self).load(config.bind, function (err, bind) {
        
        if (err) {
            // TODO do something on error
            return;
        }
        
        // save bind instance
        self.bind = bind;
        
        // render html
        if (bind.view) {
            bind.view.render();
            
            // TEST NAVIGATION
            var elms = bind.view.dom.querySelectorAll('.navbar-collapse li');
            var home = bind.view.dom.querySelector('.navbar-brand');
            
            home.addEventListener('click', function () {
                bind.state.emit('/');
            }, false);
            
            elms[0].addEventListener('click', function () {
                bind.state.emit('/editor');
            }, false);
            elms[1].addEventListener('click', function () {
                bind.state.emit('/list');
            }, false);
            elms[2].addEventListener('click', function () {
                bind.state.emit('/list');
            }, false);
            elms[3].addEventListener('click', function () {
                bind.state.emit('/list');
            }, false);
            elms[4].addEventListener('click', function () {
                bind.state.emit('/list');
            }, false);
        }
        
        // emit an empty state is the same like: state.emit(location.pathname);
        bind.state.emit();
        self.emit('ready');
    });
}

module.exports = init;

return module;

});
