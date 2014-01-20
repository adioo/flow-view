M.wrap('github/jillix/layout/v0.0.1/layout.js', function (require, module, exports) {

var Bind = require('github/jillix/bind/v0.0.1/bind');

/*
    // custom code
    M.custom = {
        bind: {
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
*/

var config = {
    "title": "Mono Dev",
    "crud": "dataTemplateId",
    "view": {
        "html": 'html/layout.html',
        "css": ['css/style.css'],
        "on": {
            "data": "M.custom.bind.addCount",
            "view": "M.custom.bind.resetCount"
        }
    },
    "to": "body",
    "data": [
        {title: 'Rendered with bind', text: 'Bind binds content dynamically to a html snippet', 'test': {'dot': {'notation': 'deep value'}}},
        {title: 'Rendered with bind', text: 'Bind binds content dynamically to a html snippet', 'test': {'dot': {'notation': 'deep value'}}},
        {title: 'Rendered with bind', text: 'Bind binds content dynamically to a html snippet', 'test': {'dot': {'notation': 'deep value'}}}
    ],
    "states": {
        // url: /de/articles/shoesCatId/menCatId/sportCatId
        "articles": {
            'bind.states.initArticleList': {
                "css": {'#selector': {/*css*/}},
                "title": -1
            }
        },
        // url: /article/articleId
        "article": {
            'bind.states.initArticleDetail': {
                "css": {'#selector': {/*css*/}},
                "id": -1
            }
        }
    },
    /*
    set default data
    set default crud configs
    set events and handlers
    "read": {
        "q": {}
    },*/
    
};

function init () {
    var self = this;
    
    //config = self.mono.config;
    
    // set document title
    if (config.title) {
        document.title = config.title;
    }
    
    // init bind
    Bind(self);
    
    // init crud
    if (config.crud) {
        self.crud = self.bind.crud(config.crud);
    }
    
    // init state
    if (config.states) {
        self.state = self.bind.state(config.states);
    }
    
    // init view
    if (config.view) {
        self.bind.view(config.view, function (err, view) {
            
            if (err) {
                // TODO handle errors
                return;
            }
            
            self.view = view;
            
            // save dom target on view
            if (config.to) {
                view.dom = document.querySelector(config.to);
            }
            
            // set data
            if (config.data) {
                view.data = config.data;
            }
            
            // read data
            if (config.read) {
                view.read(config.read, function (err, data) {
                    
                    if (err) {
                        return;
                    }
                    
                    if (data) {
                        view.data = data;
                    }
                    
                    // render
                    view.render();
                    self.emit('ready');
                });
            } else {
                // render
                view.render();
                //view.state('/test/url');
                //view.state();
                self.emit('ready');
            }
        });
    } else {
        self.emit('ready');
    }
}

module.exports = init;

return module;

});
