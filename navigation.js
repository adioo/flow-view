M.wrap('github/jillix/navigation/v0.0.1/navigation.js', function (require, module, exports) {

var View = require('github/jillix/view/v0.0.1/view');

// emit dom states
function domStateHandler (self, view, state) {
    return function () {
        // save current active dom elm
        self.active = this;
        
        // change state
        changeState.call(self, view, state);
    };
}

function changeState (view, state) {
    var self = this;
    
    if (state === '/') {
        state = '';
    }
    
    // compute the new state
    var base = location.pathname.split('/').slice(0, self.baseLength + 1).join('/') + '/';
    var newState = state[0] === '/' ? base.substr(1) + state : base + state;

    // emit the new state
    view.state.emit(newState);
}

function activate (state) {
    var self = this;

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
                model.read({q: {}}, function (err, data) {
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

function init () {
    var self = this;
    var config = self.mono.config.data;
    var V = View(self);

    if (!config) {
        return console.log('[nav: no config available]');
    }

    // state handler
    self.activate = activate;
    
    // set base
    self.baseLength = config.baseLength || 0;
    if (self.baseLength < 0) {
        self.baseLength = 0;
    }

    // init layout view
    V.load(config.layout, function (err, layout) {

        if (err) {
            return console.log('[nav: ' + err.toString() + ']');
        }
        
        // return when no dom is available
        if (!layout.template && layout.template.dom) {
            return console.log('[nav: no dom available]');
        }
        
        self.layout = layout;
        
        // render html
        layout.template.render();
        
        // init item view
        V.load(config.item, function (err, item) {

            if (err) {
                return console.log('[nav: ' + err.toString() + ']');
            }
            
            // return when no dom is available
            if (!item.template && item.template.dom) {
                return console.log('[nav item: no dom available]');
            }

            loadModel(config, item, function(err, data) {
            
                if (err) {
                    return console.log('[nav: ' + err.toString() + ']');
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
                for (i = 0; i < items.length; ++i) {
                    var $item = $(items[i]);
                    $(items[i]).on('click', domStateHandler(self, item, data[i][config.stateKey]));
                }
                
                // emit state events on dom elms
                if (config.domStates) {
                    for (i = 0; i < config.domStates.length; ++i) {
                        // get element
                        var elm = $(config.domStates[i].selector, layout.template.dom);
                        if (elm) {
                            elm.on(config.domStates[i].event, domStateHandler(self, item, config.domStates[i].state));
                        }
                    }
                }
                
                item.state.emit();
            });
        });
    });
}

module.exports = init;

return module; });
