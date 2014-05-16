M.wrap('github/jillix/table/v0.0.1/table.js', function (require, module, exports) {

function createTemplates (schema) {
    
    // create headers and rows
    var columns = {
        headers: '<tr>',
        rows: '<tr data="">'
    };
    
    for (var i = 0; i < schema.length; ++i) {
        columns.headers += '<th>' + schema[i].label + '</th>';
        columns.rows += '<td>{' + schema[i].prop + '}</td>';
    }
    
    columns.headers += '</tr>';
    columns.rows += '</tr>';
    
    return columns;
}

function routeHandler (event, keys, separator) {
    var self = this;
    
    // create route path
    var path = location.pathname;
    for (var i = 0, value; i < keys.length; ++i) {
        
        value = self.path(keys[i], event.item);
        
        if (typeof value !== 'undefined') {
            path += (value instanceof Array ? value[0] : value) + (separator || '');
        }
    }
    // route
    self.route(path);
}

function setItem (event) {
    this.item = event.item;
}

function load (state, modelData) {
    var self = this;
    
    // reset current item
    self.currentItem = null;
    
    // state can't be emitted before the view is ready
    if (!self.item || !self.head) {
        return;
    }
    
    if (!state.view) {
        return console.error('[table: ' + 'No info to fetch view.]');
    }
    
    // reset headers
    if (self.head.dom) {
        self.head.dom.innerHTML = '';
    }
    
    // reset items
    if (self.item.dom) {
        self.item.dom.innerHTML = '';
    }
    
    // load view from url
    self.view(state.view, function (err, view) {
        
        if (err || !view) {
            return console.error('[table: ' + (err ? err.toString() : 'No view found.') + ']');
        }
        
        // create templates from view config
        var templates = createTemplates(view.config.columns);
        
        // set header template
        self.head.set(templates.headers, 'thead', self.layout.dom);
        
        // set items template
        view.set(templates.rows, 'tbody', self.layout.dom);
        
        view.req({m: 'find', d: view.config.req}, function (err, data) {
            
            if (err) {
                return console.error('[table: ' + err.toString() + ']');
            }
            
            // render title
            self.title.render([{title: state.view}]);
            
            // render head
            self.head.render();
        });
    });
}

function init () {
    var self = this;
    var config = self.mono.config.data;
    
    // append route handler
    self.routeHandler = routeHandler;
    
    // append item handler
    self.setItem = setItem;
    self.on('getItem', function (callback) {
        callback(null, self.item);
    });
    
    // init view
    if (config && config.layout) {
        
        self.view(config.layout, function (err, layout) {
            
            if (err) {
                return console.error(err);
            }
            
            // save view instance
            self.layout = layout;
            
            if (self.layout) {
                
                // render layout view
                self.layout.render();
                
                // load controller
                var count = 0;
                var handler = function (err) {
                    
                    if (err) {
                        return self.emit('ready', err);
                    }
                    
                    if (++count === 3) {
                        
                        //add click to create button
                        var create = config.create;
                        $(create).on('click', function () {
                            self.route(location.pathname + 'new/');
                        });
                        
                        // state handler
                        self.load = load;
                        
                        self.emit('ready');
                    }
                };
                
                // create title view
                self.view({to: '.tableTitle', in: self.layout.dom, html: '<h1>{title}</h1>'}, function (err, view) {
                    self.title = view;
                    handler(err);
                });
                
                // create head view
                self.view(function(err, view) {
                    self.head = view;
                    handler(err);
                });
                
                // create item view
                self.view(function(err, view) {
                    self.item = view;
                    handler(err);
                });
            }
        });
    }
}

module.exports = init;

return module;

});
