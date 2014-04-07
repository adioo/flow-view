M.wrap('github/jillix/layout/v0.0.1/layout.js', function (require, module, exports) {

var View = require('github/jillix/view/v0.0.1/view');

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
    
    // load page modules
    if (options.modules) {
        for (var i = 0; i < options.modules.length; ++i) {
            M(options.modules[i]);
        }
    }
    
    self.pages.hide();
    
    var targetPage = $(target, self.view.template.dom);
    
    // animate page transition
    if (options.animate) {
        animate.call(self, targetPage, options.animate);
    
    // show requested page
    } else {
        targetPage.show();
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

function localChange () {
    // TODO fetch data and render template
}

function init () {
    var self = this;
    var pageName = '_page_' + self.mono.name;
    var config = self.mono.config.data;
    
    // set document title
    if (config.title) {
        document.title = config.title;
    }
    
    // attach state handler to instance
    self.page = page;
    
    // state handler to handle css in pages
    self.pageSelector = '.' + pageName;
    
    // TODO on i18n
    self.on('i18n', localChange);
    
    // init view
    View(self).load(config.view, function (err, view) {
        
        if (err) {
            return console.error('[layout: ' + err.toString() + ']');
        }
        
        // check if template has dom
        if (!view.template || !view.template.dom) {
            return console.error('[layout: no dom available]');
        }
        
        // render template
        view.template.render([{page: pageName}]);
        
        // save view instance
        self.view = view;
        
        // get pages dom refs
        self.pages = $(self.pageSelector, self.view.template.dom);
        
        // hide all pages in init state
        self.pages.hide();
        
        // handle not found
        if ((self.notFound = $(config.notFound, self.view.template.dom))) {
            self.on('route', notFoundHandler);
        }
        
        self.emit('ready');
    });
}

module.exports = init;

return module;

});
