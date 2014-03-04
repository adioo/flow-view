M.wrap('github/jillix/layout/v0.0.1/layout.js', function (require, module, exports) {

var View = require('github/jillix/view/v0.0.1/view');

function page (state, target, options) {
    var self = this;
    
    // return when no target page is given
    if (!target) {
        return;
    }
    
    // clear timeout
    self._state = true;
    
    options = options || {};
    
    var targetPage = $(target, self.view.template.dom);
    
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
    
    // animate page transition
    if (options.animate) {
        animate.call(self, self.current, targetPage, options.animate);
    
    // show requested page
    } else {
        targetPage.show();
    }
    
    // set new current
    self.current = targetPage;
}

// not found handler
function stateHandler () {
    var self = this;
    
    if (!self._state) {
        self.pages.hide();
        self.notFound.show();
    }
    
    self._state = false;
}

// animate page transitions
function animate (from, to, config) {
    var self = this;
    
    if ((!config.from && !config.to) || (!from && !to)) {
        return;
    }
    
    var i, elm;
    
    /*if (from && config.from) {
        for (i = 0; i < config.from.length; ++i) {
            
            // get element
            elm = config.from[i].elm ? $(config.from[i].elm, from) : from;
            
            // handle show/hide
            if (config.from[i].fx === 'show' || config.from[i].fx === 'hide') {
                elm[config.from[i].fx]();
            
            // handle animateion
            } else {
                
                // set timing
                if (config.from[i].dd) {
                    elm.css("-webkit-animation-duration", config.from[i].dd[0]);
                    elm.css("-webkit-animation-delay", config.from[i].dd[1]);
                }
                
                elm.one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', (function (config, elm) {
                    return function () {
                        elm.hide();
                        console.log('from animation "' + config.fx + '" done. duration: ' + config.dd[0] + ', delay: ' + config.dd[1]);
                    };
                })(config.from[i], elm));
                
                // start animation
                elm.addClass('animated ' + config.from[i].fx);
            }
        }
    }*/
    
    if (to && config.to) {
        for (i = 0; i < config.to.length; ++i) {
            
            // get element
            elm = config.to[i].elm ? $(config.to[i].elm, to) : to;
            
            // handle show/hide
            if (config.to[i].fx === 'show' || config.to[i].fx === 'hide') {
                elm[config.to[i].fx]();
            
            // handle animateion
            } else {
                
                // set timing
                if (config.to[i].dd) {
                    elm.css("-webkit-animation-duration", config.to[i].dd[0]);
                    elm.css("-webkit-animation-delay", config.to[i].dd[1]);
                }
                
                /*elm.one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', (function (config, elm) {
                    return function () {
                        console.log('to animation "' + config.fx + '" done. duration: ' + config.dd[0] + ', delay: ' + config.dd[1]);
                    };
                })(config.to[i], elm));*/
                
                // start animation
                elm.addClass('animated ' + config.to[i].fx);
                elm.show();
            }
        }
    }
}

function init () {
    var self = this;
    var pageName = '_page_' + self.mono.name;
    var subModules = self.mono.config.modules;
    
    config = self.mono.config.data;
    
    // set document title
    if (config.title) {
        document.title = config.title;
    }
    
    // attach state handler to instance
    self.page = page;
    
    // state handler to handle css in pages
    self.pageSelector = '.' + pageName;
    
    // emit initial state after sub modules are loaded
    if (subModules) {
        self.on('subReady', function () {
            self.view.state.emit();
        });
    }
    
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
        self.notFound = $(config.notFound, self.view.template.dom);
        if (self.notFound) {
            
            // attach after state handler
            self.view.state.after = stateHandler;
            
            // show not found page
            self.notFound.hide();
        }
        
        // emit initial state if no sub modules are loaded
        if (!subModules) {
            self.view.state.emit();
        }
        
        self.emit('ready');
    });
}

module.exports = init;

return module;

});
