M.wrap('github/jillix/navigation/v0.0.1/navigation.js', function (require, module, exports) {

var View = require('github/jillix/view/v0.0.1/view');

function init () {
    var self = this;

    // state handler
    self.activate = activate;

    var config = self.mono.config.data;

    var view = View(self);

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

                $('[data-nav]', self.layout.dom).on('click', function() {
                    item.state.emit($(this).attr('data-nav'));
                });

                item.state.emit();
            });
        });
    });
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
