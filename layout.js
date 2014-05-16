M.wrap('github/jillix/layout/v0.0.1/layout.js', function (require, module, exports) {

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
    
    self.pages.hide();
    
    var targetPage = $(target, self.layout.dom);
    
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
    
    // load a view
    self.view(config.view, function (err, view) {
      
        if (err) {
            return console.error('[layout: ' + err.toString() + ']');
        }
        
        // check if template has dom
        if (!view || !view.dom) {
            return console.error('[layout: no dom available]');
        }
        
        // render template
        view.render([{page: pageName}]);
        
        // save view instance
        self.layout = view;
        
        // get pages dom refs
        self.pages = $(self.pageSelector, self.layout.dom);
        
        // hide all pages in init state
        self.pages.hide();
        
        // handle not found
        if ((self.notFound = $(config.notFound, self.layout.dom))) {
            self.on('route', notFoundHandler);
        }
        
        // listen to locale change event
        if (view.config && view.config.req) {
            self.on('i18n', localChange);
        }
        
        self.emit('ready');
    });
}

module.exports = init;

return module;

});
