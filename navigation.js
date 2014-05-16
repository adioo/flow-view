M.wrap('github/jillix/navigation/v0.0.1/navigation.js', function (require, module, exports) {

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
    $('.active', self.layout.dom).removeClass('active');

    // add the active class to the active navigation tab
    if (self.active) {
        $(self.active).addClass('active');
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

    if (!config) {
        return console.error('[nav: no config available]');
    }
    
    config.labelKey = config.labelKey || 'label';

    self.config = config;
    
    // set base
    config.baseLength = config.baseLength || 0;
    if (config.baseLength < 0) {
        config.baseLength = 0;
    }
    self.base = (location.pathname.split('/').slice(0, config.baseLength + 1).join('/') + '/').replace(/\/\//, '/');
    
    // get current active
    var active = null;
    if (config.pattern) {
        self.pattern = config.pattern;
        active = getActiveNameFromUrl(config.pattern);
    }
    
    // init layout view
    self.view(config.layout, function (err, layout) {

        if (err) {
            return console.error('[nav: ' + err.toString() + ']');
        }
        
        // return when no dom is available
        if (!layout && layout.dom) {
            return console.error('[nav: no dom available]');
        }
        
        // render html
        layout.render();
        self.layout = layout;
        
        // init item view
        self.view(config.item, function (err, item) {

            if (err) {
                return console.error('[nav: ' + err.toString() + ']');
            }
            
            // return when no dom is available
            if (!item && item.dom) {
                return console.error('[nav item: no dom available]');
            }
            
            self.item = item;
            
            var data = item.config.items;
                
            // check if stateKey exists
            if (!data[0] || typeof data[0][config.stateKey] === 'undefined') {
                 return console.error('[nav: No url key found]');
            }
            
            // render items
            item.render(data);
            
            // add change state handler to nav items
            var i = 0;
            var items = $('li', item.dom);
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
            
            // emit state events from dom elms
            if (config.domStates) {
                for (i = 0; i < config.domStates.length; ++i) {
                    // get element
                    var elm = $(config.domStates[i].selector, layout.dom);
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
}

module.exports = init;

return module; });
