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

        // getting the in animation
        if (!config.animations.inAnimation || config.animations.inAnimation === "none") {
            var inAnimation = "fadeIn";
            var inDuration = "0s";
            var inDelay = "0s";
        } else {
            var inAnimation = config.animations.inAnimation.effect;
            var inDuration = config.animations.inAnimation.duration || ".5s";
            var inDelay = config.animations.inAnimation.delay || "0s";
        }

        // getting the current out animation
        var outAnimation = oldState.attr("active");
        var outDuration = oldState.attr("duration");
        var outDelay = oldState.attr("delay");

        oldState.removeAttr("active");
        oldState.removeAttr("duration");
        oldState.removeAttr("delay");

        // setting the future out animation
        if (!config.animations.outAnimation || config.animations.outAnimation === "none") {
            newState.attr("active", "fadeOut");
            newState.attr("duration", "0s");
            newState.attr("delay", "0s");
        } else {
            newState.attr("active", config.animations.outAnimation.effect);
            newState.attr("duration", config.animations.outAnimation.duration || ".5s");
            newState.attr("delay", config.animations.outAnimation.delay || "0s");
        }

        // hiding all elements
        $(self.mono.config.data.selector).hide();

        // there is no old state (the first time a page is loaded)
        if (oldState.length === 0) {
            newState.css("-webkit-animation-duration", inDuration);
            newState.css("-webkit-animation-delay", inDelay);
            newState.addClass("animated " + inAnimation);
            newState.show();
        } else {
            if (outDuration === "0s") {
                newState.removeClass("animated " + inAnimation + " " + outAnimation);
                newState.css("-webkit-animation-duration", inDuration);
                newState.css("-webkit-animation-delay", inDelay);
                newState.addClass("animated " + inAnimation);
                newState.show();
            } else {
                // out animation is done
                oldState.one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function () {
                    oldState.hide();
                    oldState.removeClass("animated " + inAnimation + " " + outAnimation);
                    newState.css("-webkit-animation-duration", inDuration);
                    newState.css("-webkit-animation-delay", inDelay);
                    newState.addClass("animated " + inAnimation);
                    newState.show();
                });
                oldState.css("-webkit-animation-duration", outDuration);
                oldState.css("-webkit-animation-delay", outDelay);
                oldState.addClass("animated " + outAnimation);
                oldState.show();
            }
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
