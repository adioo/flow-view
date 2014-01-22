M.wrap('github/jillix/layout/v0.0.1/layout.js', function (require, module, exports) {

var Bind = require('github/jillix/bind/v0.0.1/bind');

// custom code
M.custom = {
    bind: {
        addCount: function (data) {
            this.count = this.count || 0;
            data.custom = ++this.count;
            return data;
        },
        resetCount: function (html) {
            this.count = 0;
        }
    }
};

function stateHandler (config) {
    var self = this;
    
    if (self.view) {
        
        if (config.data) {
            self.view.render(config.data);
        }
        
        // set css
        if (config.css) {
            for (var selector in config.css) {
                var elm = self.view.dom.querySelector(selector);
                if (elm) {
                    for (var style in config.css[selector]) {
                        elm.style[style] = config.css[selector][style];
                    }
                }
            }
        }
    }
}

function init () {
    var self = this;
    self.stateHandler = stateHandler;
    
    config = self.mono.config.data;
    
    // set document title
    if (config.title) {
        document.title = config.title;
    }
    
    // init bind
    var B = Bind(self);//.setup(config);
    
    // init crud
    if (config.crud) {
        self.crud = B.crud(config.crud);
    }
    
    // init state
    if (config.states) {
        self.state = B.state(config.states);
        self.on('ready', function () {
            self.state.set();
        });
    }
    
    // init view
    if (config.view) {
        B.view(config.view, function (err, view) {
            
            if (err) {
                // TODO handle errors
                return;
            }
            
            self.view = view;
            
            // save dom target on view
            if (config.to) {
                view.dom = document.querySelector(config.to);
            }
            
            // set data
            if (config.data) {
                view.data = config.data;
            }
            
            // read data
            if (config.read) {
                view.read(config.read, function (err, data) {
                    
                    if (err) {
                        return;
                    }
                    
                    if (data) {
                        view.data = data;
                    }
                    
                    self.emit('ready');
                });
            } else {
                
                // TEST NAVIGATION
                view.on.done = function (view) {
                    view.dom.querySelector('h1').addEventListener('click', function () {
                        if (window.location.pathname === '/') {
                            self.state.set('/articles');
                        } else {
                            self.state.set('/');
                        }
                    }, false);
                };
                
                self.emit('ready');
            }
        });
    } else {
        self.emit('ready');
    }
}

module.exports = init;

return module;

});
