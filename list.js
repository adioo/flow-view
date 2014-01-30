M.wrap('github/jillix/list/v0.0.1/list.js', function (require, module, exports) {

var Bind = require('github/jillix/bind/v0.0.1/bind');

// TODO handle errors
// TODO get data from db
var dbData = {
    "modules": [
        {
            "_id": "github/jillix/bind/v0.0.1",
            "source": "github",
            "owner": "jillix",
            "name": "bind",
            "version": "v0.0.1",
            "main": "server/bind.js",
            "dependencies": [
                "./bind.js",
                "./state.js",
                "./view.js",
                "./crud.js"
            ]
        },
        {
            "_id": "github/jillix/layout/v0.0.1",
            "source": "github",
            "owner": "jillix",
            "name": "layout",
            "version": "v0.0.1",
            "main": "main.js",
            "dependencies": [
                "./layout.js",
                "github/jillix/bind/v0.0.1/bind.js",
                "github/jillix/bind/v0.0.1/state.js",
                "github/jillix/bind/v0.0.1/view.js",
                "github/jillix/bind/v0.0.1/crud.js",
                "//netdna.bootstrapcdn.com/bootstrap/3.0.3/js/bootstrap.min.js"
            ]
        },
        {
            "_id": "github/jillix/list/v0.0.1",
            "source": "github",
            "owner": "jillix",
            "name": "list",
            "version": "v0.0.1",
            "main": "server/list.js",
            "dependencies": [
                "./list.js",
                "github/jillix/bind/v0.0.1/bind.js",
                "github/jillix/bind/v0.0.1/state.js",
                "github/jillix/bind/v0.0.1/view.js",
                "github/jillix/bind/v0.0.1/crud.js"
            ]
        },
        {
            "_id": "github/jillix/editor/v0.0.1",
            "source": "github",
            "owner": "jillix",
            "name": "editor",
            "version": "v0.0.1",
            "main": "server/editor.js",
            "dependencies": [
                "./editor.js",
                "github/jillix/bind/v0.0.1/bind.js",
                "github/jillix/bind/v0.0.1/state.js",
                "github/jillix/bind/v0.0.1/view.js",
                "github/jillix/bind/v0.0.1/crud.js"
            ]
        }
    ],
    "roles": [
        {"name": "admin"},
        {"name": "user"}
    ],
    "instances": [
        {
            "module": "github/jillix/layout/v0.0.1",
            "miid": "start",
            "roles": ["52cd737d7bd8b0b50f584e80"],
            "client": {
                "modules": ["navigation", "list", "editor"],
                "events": ["getHtml", "read", "bindLoad"],
                "data": {
                    "title": "Mono Admin",
                    "bind": "startBind"
                }
            },
            "server": {
                "events": ["html", "data", "bindConfig"]
            }
        },
        {
            "module": "github/jillix/list/v0.0.1",
            "miid": "navigation",
            "roles": ["52cd737d7bd8b0b50f584e80"],
            "client": {
                "events": ["getHtml", "read", "bindLoad"]
            },
            "server": {
                "events": ["html", "data", "bindConfig"]
            }
        },
        {
            "module": "github/jillix/list/v0.0.1",
            "miid": "list",
            "roles": ["52cd737d7bd8b0b50f584e80"],
            "client": {
                "events": ["getHtml", "read", "bindLoad"],
                "data": {
                    "bind": "listBind",
                    "items": "itemsBind"
                }
            },
            "server": {
                "events": ["html", "data", "bindConfig"]
            }
        },
        {
            "module": "github/jillix/editor/v0.0.1",
            "miid": "editor",
            "roles": ["52cd737d7bd8b0b50f584e80"],
            "client": {
                "events": ["getHtml", "read", "bindLoad"],
                "data": {
                    "bind": "editorBind"
                }
            },
            "server": {
                "events": ["html", "data", "bindConfig"]
            }
        }
    ],
    "binds": [
        {
            "_id": "startBind",
            "crud": "dataTemplateId",
            "view": {
                "html": "layout.html",
                //"css": ["//netdna.bootstrapcdn.com/bootstrap/3.0.3/css/bootstrap.min.css", "//netdna.bootstrapcdn.com/bootstrap/3.0.3/css/bootstrap-theme.min.css"],
                "css": ["/css/bootstrap.min.css", "/css/bootstrap-theme.min.css"]
                /*"on": {
                    "data": "M.custom.bind.addCount",
                    "html": "M.custom.bind.resetCount"
                }*/
            },
            "to": "body",
            "notFound": "/404",
            "states": {
                "/": {
                    "page": [{
                        "#home": {"display": "block"},
                        "#list": {"display": "none"},
                        "#editor": {"display": "none"},
                        "#notFound": {"display": "none"}
                    }]
                },
                "/list": {
                    "page": [{
                        "#home": {"display": "none"},
                        "#list": {"display": "block"},
                        "#editor": {"display": "none"},
                        "#notFound": {"display": "none"}
                    }]
                },
                "/editor": {
                    "page": [{
                        "#home": {"display": "none"},
                        "#list": {"display": "none"},
                        "#editor": {"display": "block"},
                        "#notFound": {"display": "none"}
                    }]
                },
                "/404": {
                    "page": [{
                        "#home": {"display": "none"},
                        "#list": {"display": "none"},
                        "#editor": {"display": "none"},
                        "#notFound": {"display": "block"}
                    }]
                }
            }
        },
        {
            "_id": "listBind",
            "crud": "dataTemplateId",
            "view": {
                "html": "list.html"
            },
            "to": "#list",
            "states": {
                "/list": {
                    "state": []
                }
            }
        },
        {
            "_id": "itemBind",
            "crud": "dataTemplateId",
            "view": {
                "html": "item.html"
            },
            "to": "#items",
            "states": {
                "/list": {
                    "load": []
                }
            }
        },
        {
            "_id": "editorBind",
            "crud": "dataTemplateId",
            "view": {
                "html": "editor.html",
                "css": ["editor.css"]
            },
            "to": "#editor",
            "states": {
                "/editor": {
                    "load": []
                }
            }
        }
    ]
};
var templates = {
    "modules": {
        "schema": {
            "_id": {},
            "source": {},
            "owner": {},
            "name": {},
            "version": {},
            "main": {},
            "dependencies": [{}]
        }
    },
    "roles": {
        "schema": {
            "name": {}
        }
    },
    "instances": {
        "schema": {
            "module": {},
            "miid": {},
            "roles": [{}],
            "client": {
                "modules": [{}],
                "events": [{}],
                "scripts": [{}],
                "data": {}
            },
            "server": {
                "events": [{}],
                "data": {}
            }
        }
    },
    "binds": {
        "schema": {
            "_id": {},
            "crud": {},
            "view": {
                "html": {},
                "css": [{}],
                "on": {
                    "data": {},
                    "html": {}
                }
            },
            "to": {},
            "notFound": {},
            "states": {}
        }
    }
};

function createTemplates (schema) {
    
    // create headers and rows
    var columns = {
        headers: '<tr>',
        rows: '<tr data="">'
    };
    
    for (var field in schema) {
        columns.headers += '<th>' + field + '</th>';
        columns.rows += '<td>{' + field + '}</td>';
    }
    columns.headers += '</tr>';
    columns.rows += '</tr>';
    
    return columns;
}

function load () {
    var self = this;
    var template = location.pathname.split('/')[2];
    
    // render title
    if (self.title) {
        self.title.view.render([{title: template}]);
    }
    
    // render header
    if (templates[template] && dbData[template]) {
        
        var htmls = createTemplates(templates[template].schema);
        
        // render header
        if (self.head) {
            self.head.view.setTemplate(htmls.headers);
            self.head.view.render();
        }
        
        // render items
        if (self.item) {
            self.item.view.setTemplate(htmls.rows);
            self.item.view.render(dbData[template]);
        }
    }
}

function init () {
    var self = this;
    var config = self.mono.config.data;
    
    self.load = load;
    
    // init bind
    if (config && config.layout) {
        var B = Bind(self);
        B.load(config.layout, function (err, layout) {
            
            if (err) {
                return;
            }
            
            // save bind instances
            self.layout = layout;
            
            if (self.layout.view) {
                
                // render layout view
                self.layout.view.render();
                
                // load controller
                var count = 0;
                var handler = function (err) {
                    if (++count === 3) {
                        layout.state.emit();
                        self.emit('ready');
                    }
                };
                
                // load title
                if (config.title) {
                    B.load(config.title, function (err, title) {
                        self.title = title;
                        handler(err);
                    });
                } else {
                    handler();
                }
                
                // load headers
                if (config.head) {
                    B.load(config.head, function (err, head) {
                        self.head = head;
                        handler(err);
                    });
                } else {
                    handler();
                }
                
                // load items
                if (config.item) {
                    B.load(config.item, function (err, item) {
                        self.item = item;
                        handler(err);
                    });
                } else {
                    handler();
                }
            }
        });
    }
}

module.exports = init;

return module;

});
