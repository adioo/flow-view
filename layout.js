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
        }
        
        // emit an empty state is the same like: state.emit(location.pathname);
        view.state.emit();
        self.emit('ready');
    });
}

module.exports = init;

return module;

});
