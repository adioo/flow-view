M.wrap('github/jillix/navigation/v0.0.1/navigation.js', function (require, module, exports) {

var View = require('github/jillix/view/v0.0.1/view');

function init () {
    var self = this;
    var config = self.mono.config.data;
    var view = View(self);

    if (!config) {
        return;
    }

    // state handler
    self.activate = activate;
    // set base
    self.baseLength = config.baseLength || 0;
    if (self.baseLength < 0) {
        self.baseLength = 0;
    }

    // init layout view
    view.load(config.layout, function (err, layout) {

        if (err) {
            // TODO do something on error
            return;
        }

        if (layout.template) {
            layout.template.render();
        }

        self.layout = layout;

        // init item view
        view.load(config.item, function (err, item) {

            if (err) {
                // TODO do something on error
                return;
            }

            loadModel(config, item, function(err, data) {
            
                if (err) {
                    // TODO do something on error
                    return;
                }
                
                item.template.render(data);
                
                // add change state handler to the brand (bootstrap)
                if (config.brand) {
                    $('.navbar-brand').on('click', function () {
                        changeState.call(self, item, config.brand);
                    });
                }
                
                // add change state handler to nav items
                if (self.layout && self.layout.template && self.layout.template.dom) {
                    $('[data-nav]', self.layout.template.dom).on('click', function() {
                        changeState.call(self, item, $(this).attr('data-nav'));
                    });
                }

                item.state.emit();
            });
        });
    });
}

function changeState (view, data) {
    var self = this;

    // compute the new state
    var base = location.pathname.split('/').slice(0, self.baseLength + 1).join('/') + '/';
    var newState = data[0] === '/' ? base.substr(1) + data : base + data;

    // emit the new state
    view.state.emit(newState);
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

function activate (state) {
    var self = this;

    // remove the active class
    $('.active', self.layout.dom).removeClass('active');

    // add the active class to the active navigation tab
    $('[data-nav="' + state.name + '"]', self.layout.dom).parent().addClass('active');
}

module.exports = init;

return module; });
