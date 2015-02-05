// var $ = require('/libs/jquery');

//exports.page = page;
//exports.transition = transition;
//exports.state = state;
//exports.$jq = $jq;

exports.test = function () {

    console.log('TEST METHOD FIRED!', arguments);
}

function init (config) {
    var self = this;
    var pageName = '_page_' + self._name;

    // state handler to handle css in pages
    self.pageSelector = '.' + pageName;

    // get pages dom refs
    self.pages = $(self.pageSelector);

    // hide all pages in init state
    self.pages.hide();

    // handle not found
    if ((self.notFound = $(config.notFound))) {
        self.on('route', notFoundHandler);
    }
}

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

    var targetPage = $(target);

    // animate page transition
    if (options.animate) {
        animate.call(self, targetPage, options.animate);

    // show requested page
    } else {
        targetPage.show();
    }
}

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

// mainpulate dom with jquery
function $jq (event, data, callback) {
    var self = this;
    var selector = data.selector;

    // call jquery function
    if ($.fn[data.method]) {

        // get selector dom ref
        if (typeof selector === 'string') {

            // get selector
            switch (selector) {
                case 'cur':
                    selector = event.currentTarget;
                    break;
                case 'src':
                    selector = event.srcElement;
                    break;
                case 'all':
                    selector = event._elms;
                    break;
            }
        }

        // get scope dom ref
        if (typeof data.scope === 'string') {
            data.scope = document.querySelector(data.scope);
        }

        // call method
        selector = $(selector, data.scope || event._scope);

        selector[data.method].apply(selector, data.args);

        return callback();
    }

    callback('jQuery method "' + method + '" doesn\'t exists.');
}
