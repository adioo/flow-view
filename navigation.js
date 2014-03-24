M.wrap('github/jillix/navigation/v0.0.1/navigation.js', function (require, module, exports) {

var View = require('github/jillix/view/v0.0.1/view');

// emit dom states
function domStateHandler (self, view, config) {
    
    var state;
    
    // set default setActive value to true
    if (config.setActive === undefined) {
        config.setActive = true;
    }
    
    // compute the new state
    if (config[self.config.stateKey]) {
        state = self.base + config[self.config.stateKey].replace(/^\//, '');
    }
    
    return function () {
        
        // save current active dom elm
        if (config.setActive) {
            self.active = this;
        }
        
        // emit the new state
        if (state) {
            self.route(state);
        }
        
        // emit events
        if (config.emit) {
            for (var i = 0; i < config.emit.length; ++i) {
                self.push(config.emit[i].inst || self.mono.name, config.emit[i].name, config.emit[i].args || []);
            }
        }
    };
}

function activate (state) {
    var self = this;
    
    // set active when state is emitted from popstate
    if (self.pattern && state.pop) {
        var active = state.url === self.base ? '/' : getActiveNameFromUrl(self.pattern);
        if (self.items[active]) {
            self.active = self.items[active];
        }
    }
    
    // remove the active class
    $('.active', self.layout.template.dom).removeClass('active');

    // add the active class to the active navigation tab
    if (self.active) {
        $(self.active).addClass('active');
    }
}

function loadModel (config, item, callback) {

    switch (typeof config.model) {

        // model by name
        case 'string':
            item.model(config.model, function (err, model) {
                model.read({q: config.query || {}}, function (err, data) {
                    callback(err, data);
                });
            });
            return;

        // model data
        case 'object':
            callback(null, config.model);
            return;

        default:
            callback('Invalid navigation model');
            return;
    }
}

function getActiveNameFromUrl (pattern) {
    var active;
    var path = location.pathname;
    if (path === self.base) {
        active = '/';
    } else {
        active = path.match(new RegExp(pattern));
        active = active ? active[1] : null;
    }
    
    return active;
}

function init () {
    var self = this;
    var config = self.mono.config.data;
    var V = View(self);

    if (!config) {
        return console.error('[nav: no config available]');
    }

    self.config = config;
    
    // set base
    config.baseLength = config.baseLength || 0;
    if (config.baseLength < 0) {
        config.baseLength = 0;
    }
    self.base = location.pathname.split('/').slice(0, config.baseLength + 1).join('/') + '/';
    
    // get current active
    var active = null;
    if (config.pattern) {
        self.pattern = config.pattern;
        active = getActiveNameFromUrl(config.pattern);
    }
    
    // parse query
    if (config.query) {
        config.query = JSON.parse(config.query);
    }
    
    // init layout view
    V.load(config.layout, function (err, layout) {

        if (err) {
            return console.error('[nav: ' + err.toString() + ']');
        }
        
        // return when no dom is available
        if (!layout.template && layout.template.dom) {
            return console.error('[nav: no dom available]');
        }
        
        self.layout = layout;
        
        // render html
        layout.template.render();
        
        // init item view
        V.load(config.item, function (err, item) {

            if (err) {
                return console.error('[nav: ' + err.toString() + ']');
            }
            
            // return when no dom is available
            if (!item.template && item.template.dom) {
                return console.error('[nav item: no dom available]');
            }

            loadModel(config, item, function(err, data) {
            
                if (err) {
                    return console.error('[nav: ' + err.toString() + ']');
                }
                
                self.item = item;
                
                // check if stateKey exists
                if (!data[0] || typeof data[0][config.stateKey] === 'undefined') {
                    return;
                }
                
                // render items
                item.template.render(data);
                
                // add change state handler to nav items
                var i = 0;
                var items = $('li', item.template.dom);
                self.items = {};
                
                for (i = 0; i < items.length; ++i) {
                    var $item = $(items[i]);
                    
                    // save state item
                    self.items[data[i][config.stateKey]] = $item;
                    
                    // save active item if found in the url
                    if (data[i][config.stateKey] === active) {
                        self.active = $item;
                    }
                    
                    $item.on('click', domStateHandler(self, item, data[i]));
                }
                
                // emit state events on dom elms
                if (config.domStates) {
                    for (i = 0; i < config.domStates.length; ++i) {
                        // get element
                        var elm = $(config.domStates[i].selector, layout.template.dom);
                        if (elm) {
                            
                            // save state items
                            self.items[config.domStates[i].state] = elm;
                            
                            // save active item if found in the url
                            if (config.domStates[i].state === active){
                                self.active = elm;
                            }
                            
                            elm.on(config.domStates[i].event, domStateHandler(self, item, config.domStates[i]));
                        }
                    }
                }
                
                // add activate item handler to state
                self.on('route', activate);
                self.emit('ready');
            });
        });
    });
}

module.exports = init;

return module; });
