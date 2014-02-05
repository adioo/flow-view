M.wrap('github/jillix/layout/v0.0.1/layout.js', function (require, module, exports) {

var View = require('github/jillix/view/v0.0.1/view');

// TODO plug a css3 animation library here
function page (config, page) {

    var self = this;

    // animations
    if (config) {
        var view = this.view;

        var oldState = $(self.mono.config.data.selector + "[active]");
        var newState = $("#" + page.page);

        var inAnimation = config.animations.inAnimation;
        var outAnimation = oldState.attr("active");

        console.log(inAnimation, outAnimation);

        oldState.removeAttr("active");
        newState.attr("active", config.animations.outAnimation);
        
        $(self.mono.config.data.selector).hide();

        if (oldState.length === 0) {
            newState.addClass("animated " + inAnimation);
            newState.show();
        } else {
            
            oldState.one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function () {
                oldState.hide();
                oldState.removeClass("animated " + inAnimation + " " + outAnimation);
                newState.addClass("animated " + inAnimation);
                newState.show();
                
            });
            oldState.addClass("animated " + outAnimation);
            oldState.show();
        }

    }
}

function init () {
    var self = this;
    
    config = self.mono.config.data;
    
    // set document title
    if (config.title) {
        document.title = config.title;
    }

    // state handler to handle css in pages
    self.page = page;
    
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
