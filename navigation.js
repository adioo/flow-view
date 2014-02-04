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

            item.model('models', function (err, model) {
                model.read({q: {}}, function (err, models) {
                    item.template.render(models);

                    $('[data-nav]', self.layout.dom).on('click', function() {
                        item.state.emit('/table/' + $(this).attr('data-nav'));
                    });

                    item.state.emit();
                });
            });
        });
    });
}

function activate () {
    var self = this;

    // remove the active class
    $('.active', self.layout.dom).removeClass('active');

    // search for the nre active element
    var path = window.location.pathname;
    var match = path.match(self.mono.config.data.pattern);

    if (!match) {
        return;
    }

    $('[data-nav="' + match[1] + '"]', self.layout.dom).parent().addClass('active');
}

module.exports = init;

return module; });
