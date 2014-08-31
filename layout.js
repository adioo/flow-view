Z.wrap('github/jillix/layout/v0.0.1/layout.js', function (require, module, exports) {

module.exports = init;

/*
    type: constructor
*/
function init (config, ready) {
    var self = this;
    var pageName = '_page_' + self._name;

    // set document title
    if (config.title) {
        self.title = config.title;
        document.title = config.title;
    }

    // attach state handler to instance
    self.page = page;
    self.transition = transition;
    self.render = render;
    self.$jq = $jq;

    // state handler to handle css in pages
    self.pageSelector = '.' + pageName;

    // render views
    if (self.view && self.view.layout) {

        // render layout and add page classes
        self.view.layout.render([{page: pageName}]);

        // get pages dom refs
        self.pages = $(self.pageSelector, self.view.layout.dom);

        // hide all pages in init state
        self.pages.hide();

        // handle not found
        if ((self.notFound = $(config.notFound, self.view.layout.dom))) {
            self.on('route', notFoundHandler);
        }
    }

    // render other views
    for (var view in self.view) {
        if (view !== 'layout') {
            self.view[view].render();
        }
    }

    ready();
}

/*
    type: actor
*/
function page (state, data) {
    var self = this;
    var target = data.show;
    var options = data.options;

    // return when no target page is given
    if (!target) {
        return;
    }

    // state found
    self._state = true;

    options = options || {};

    // hide not found
    if (self.notFound) {
        self.notFound.hide();
    }

    // set document title
    if (self.title) {
        document.title = self.title;
    }

    self.pages.hide();

    var targetPage = $(target, self.view.layout.dom);

    // animate page transition
    if (options.animate) {
        animate.call(self, targetPage, options.animate);

    // show requested page
    } else {
        targetPage.show();
    }
}

/*
    type: actor
    TODO: implement animations
*/
function transition (state, data) {

    if (!data) {
        return;
    }

    data.hide && $(data.hide).hide();
    data.show && $(data.show).show();
}

/*
    type: private
*/
function animate (elm, config) {
    var self = this;

    if (!elm || !config) {
        return;
    }

    for (var i = 0; i < config.length; ++i) {

        // get element
        elm = config[i].elm ? $(config[i].elm, elm) : elm;

        // handle show/hide
        if (config[i].fx === 'show' || config[i].fx === 'hide') {
            elm[config[i].fx]();

        // handle animateion
        } else {

            // set timing
            if (config[i].dd) {
                elm.css("-webkit-animation-duration", config[i].dd[0]);
                elm.css("-webkit-animation-delay", config[i].dd[1]);
            }

            var animate_class = 'animated ' + config[i].fx;

            // animation end handler
            elm.one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', animation_end_handler(elm, animate_class));

            // start animation
            elm.addClass(animate_class);
            elm.show();
        }
    }
}

/*
    type: actor
*/
function render (event, data) {
    var self = this;
    var view = data.view;

    if (!self.view || !self.view[view] || !data) {
        return;
    }

    // TODO Handle pages on manual rendering
    // data.item && (data.item.page = '_page_' + self._name);

    // render data
    self.view[view].render([data.item]);
}

/*
    type: actor
    desc: mainpulate dom with jquery
*/
function $jq (event, data) {
    var self = this;
    var selector = data.selector;
    var method = data.method;
    var args = data.args;

    // call jquery function
    if ($.fn[method]) {

        // get selector from url
        if (typeof selector !== 'string') {

            // return when regexp is not found
            var re = new RegExp(selector[0]);
            if (!re.test(window.location)) {
                return;
            }

            selector = window.location.href.replace(re, selector[1]);

        } else {

            // get selector
            switch (selector) {
                case 'cur':
                    selector = event.currentTarget;
                    break;
                case 'src':
                    selector = event.srcElement;
                    break;
                case 'all':
                    selector = event.elms;
                    break;
            }
        }

        // call method
        selector = $(selector);
        selector[method].apply(selector, args);
    }
}

/*
    type: private
*/
function animation_end_handler (elm, animate_class) {
    return function () {
        elm.removeClass(animate_class);
    };
}

/*
    type: private
    TODO: needs to be tested
*/
function notFoundHandler (state) {
    var self = this;

    if (self._url === state.url) {
        return;
    }

    if (!self._state) {
        self.pages.hide();
        self.notFound.show();
    }

    self._state = false;
}


return module;

});
