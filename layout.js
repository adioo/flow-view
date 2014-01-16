M.wrap('github/jillix/jlx-layout/v0.0.1/layout.js', function (require, module, exports) {

var Bind = require('github/jillix/bind/v0.0.1/bind');

function ready (err, bind) {
    var self = this;
    var config = self.mono.config;
    
    if (err) {
        return self.emit('error', err);
    }
    
    // append custom handlers
    if (config.on) {
        for (var event in config.on) {
            bind.on[event] = Object.path(config.view.on[event]);
        }
    }
    
    // set data
    if (config.data) {
        bind.data = config.data;
    }
    
    // read data
    if (config.read) {
        bind.read(config.read, function (err, data) {
            
            if (err) {
                return;
            }
            
            if (data) {
                bind.data = data;
            }
            
            // render
            bind.render();
            self.emit('ready');
        });
    } else {
        
        // render
        bind.render();
        self.emit('ready');
    }
}

function init () {
    var self = this;
    var config = self.mono.config = {
        "title": "Mono Dev",
        "bind": "bindId",
        "to": "body",
        "data": [
            {title: 'Rendered with bind', text: 'Bind binds content dynamically to a html snippet', 'test': {'dot': {'notation': 'deep value'}}},
            {title: 'Rendered with bind', text: 'Bind binds content dynamically to a html snippet', 'test': {'dot': {'notation': 'deep value'}}},
            {title: 'Rendered with bind', text: 'Bind binds content dynamically to a html snippet', 'test': {'dot': {'notation': 'deep value'}}}
        ],
        /*"read": {
            "q": {}
        },*/
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
            
            // bind config
            "on": {
                "data": "M.custom.bind.addCount",
                "done": "M.custom.bind.resetCount"
            }
        */
    } || self.mono.config;
    
    // set document title
    if (config.title) {
        document.title = config.title;
    }
    
    if (config.bind && config.to) {
        Bind(self)(config.bind, config.to, ready);
    } else {
        self.emit('ready');
    }
}

module.exports = init;

return module;

});
