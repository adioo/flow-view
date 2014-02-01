M.wrap('github/jillix/layout/v0.0.1/layout.js', function (require, module, exports) {

var View = require('github/jillix/view/v0.0.1/view');

// TODO plug a css3 animation library here
function page (config) {
    // set css
    if (config) {
        var view = this.view;
        
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
    
    // init view
    View(self).load(config.view, function (err, view) {
        
        if (err) {
            // TODO do something on error
            return;
        }
        
        // save view instance
        self.view = view;
        
        // render template
        if (view.template) {
            view.template.render();
            
            // TEST NAVIGATION
            view.model('models', function (err, model) {
                model.read({q: {}}, function (err, models) {
                    var elms = view.template.dom.querySelectorAll('#nav li');
                    var home = view.template.dom.querySelector('.navbar-brand');
                    
                    home.addEventListener('click', function () {
                        view.state.emit('/');
                    }, false);
                    
                    elms[0].addEventListener('click', function () {
                        view.state.emit('/editor/applications/52a357298eb3ce0b18000001');
                    }, false);
                    elms[1].addEventListener('click', function () {
                        view.state.emit('/table/modules');
                    }, false);
                    elms[2].addEventListener('click', function () {
                        view.state.emit('/table/roles');
                    }, false);
                    elms[3].addEventListener('click', function () {
                        view.state.emit('/table/instances');
                    }, false);
                    elms[4].addEventListener('click', function () {
                        view.state.emit('/table/views');
                    }, false);
                    elms[5].addEventListener('click', function () {
                        view.state.emit('/table/models');
                    }, false);
                    elms[6].addEventListener('click', function () {
                        view.state.emit('/table/schemas');
                    }, false);
                });
            });
        }
        
        // emit an empty state is the same like: state.emit(location.pathname);
        view.state.emit();
        self.emit('ready');
    });
}

module.exports = init;

return module;

});
