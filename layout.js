Z.wrap('github/jillix/layout/v0.0.1/layout.js', function (require, module, exports) {

function page (state, target, options) {
    var self = this;

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

function transition (state, from, to) {
    // TODO implement animations
    $(from).hide();
    $(to).show();
}

function render (state) {
    var self = this;

    if (!self.view) {
        return;
    }

    var views = self._toArray(arguments).slice(1);
    for (var i = 0; i < views.length; ++i) {
        if (self.view[views[i]]) {
            self.view[views[i]].render();
        }
    }
}

// not found handler
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

// animate page transitions
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

function animation_end_handler (elm, animate_class) {
    return function () {
        elm.removeClass(animate_class);
    };
}

function localChange (err, locale) {

    if (err) {
        return;
    }

    // TODO currentLocale != locale

    // update model with new locale on locale change event
    self.layout.req({
        m: 'find',
        q: {
            // TODO query
        }
    }, function (err, data) {

        if (err) {
            console.error(err);
        }
    });
}

function routeHandler (event, path, re) {
    var self = this;

    if (re) {
        var match = window.location.pathname.match(re);
        if (match) {

            // marge matched data into path
            for (var i = 0; i < path.length; ++i) {
                if (typeof path[i] === 'number') {
                    path[i] = match[path[i]];
                }
            }

            // route
            self.route('/' + path.join('/'));
        }
    } else {
        // route
        self.route(path);
    }
}

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
    self.render = render;
    self.transition = transition;
    self.routeHandler = routeHandler;

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

        // listen to locale change event
        //if (self.view.layout.config && self.view.layout.config.req) {
        //    self.on('i18n', localChange);
        //}
    }

    console.log('layout:', self._name);
    ready();
}

module.exports = init;

return module;

});
