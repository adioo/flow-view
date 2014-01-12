M.wrap('github/jillix/jlx-layout/v0.0.1/layout.js', function (require, module, exports) {

var Crud = require('github/jillix/jlx-crud/v0.0.1/crud');
var View = require('github/jillix/jlx-view/v0.0.1/view');

var config = {
    "title": "Mono Dev",
    "view": {
        "views": [{
            "id": "viewId",
            "to": "body"
        }]
        /*
            // custom code
            M.custom = {
                view: {
                    addCount: function (data) {
                        this.count = this.count || 0;
                        data.title = data.title + ' ' + (++this.count);
                        return data;
                    },
                    resetCount: function (html) {
                        this.count = 0;
                    }
                }
            };
            
            // view config
            "on": {
                "data": "M.custom.view.addCount",
                "done": "M.custom.view.resetCount"
            }
        */
    },
    "source": "sourceId",
    /*"read": {
        "q": {}
    },*/
    "data": [
        {title: 'Rendered with jlx-view', text: 'jlx-view binds content dynamically to a html snippet'},
        {title: 'Rendered with jlx-view', text: 'jlx-view binds content dynamically to a html snippet'},
        {title: 'Rendered with jlx-view', text: 'jlx-view binds content dynamically to a html snippet'}
    ]
};

function setupView (err, view) {
    var self = this;
    //var config = self.mono.config;
    
    if (err) {
        return self.emit('view', err);
    }
    
    // save view
    self.views.push(view);
    
    // read data from server
    if (self.crud && config.read) {
        self.crud.read(config.read, function (err, data) {
            
            if (err) {
                return;
            }
            
            // set data
            if (data) {
                view.data = data;
            }
            
            // render html
            view.render();
        });
    
    // set data
    } else {
        
        // set data
        if (config.data) {
            view.data = config.data;
        }
        
        // append custom handlers
        if (config.view.on) {
            for (var event in config.view.on) {
                view.on[event] = Object.path(config.view.on[event]);
            }
        }
        
        // render html and append it to the dom
        view.render();
        self.emit('view', null, view);
    }
}

function init () {
    var self = this;
    //var config = self.mono.config;
    
    // set document title
    if (config.title) {
        document.title = config.title;
    }
    
    // init view
    if (config.view && config.view.views) {
        
        self.views = [];
        
        // init view module
        var V = View(self);
        
        // get crud instance
        if (config.source) {
            self.crud = Crud(self)(config.source);
        }
        
        // emit ready when all views are loaded
        var count = 0;
        var viewCounter = function (err, view) {
            if (++count === config.view.views.length) {
                self.emit('ready');
            }
        };
        self.on('view', viewCounter);
        
        // load views
        for (var i = 0; i < config.view.views.length; ++i) {
            V(config.view.views[i], setupView);
        }
        
    } else {
        self.emit('ready');
    }
}

module.exports = init;

return module;

});
