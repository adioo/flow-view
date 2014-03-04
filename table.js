M.wrap('github/jillix/table/v0.0.1/table.js', function (require, module, exports) {

var View = require('github/jillix/view/v0.0.1/view');

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

function clickRowHander (state, id) {
    return function () {
        state.emit(location.pathname + id + '/');
    };
}

function load (modelName) {
    var self = this;
    
    // state can't be emitted before the view is ready
    if (!self.item || !self.head) {
        return;
    }
    
    // render items
    modelName = modelName || getModelFromUrl(self.pattern);
    if (!modelName) {
        return;
    }
    
    // reset headers
    if (self.head.template.dom) {
        self.head.template.dom.innerHTML = '';
    }
    
    // reset items
    if (self.item.template.dom) {
        self.item.template.dom.innerHTML = '';
    }
    
    self.item.model(modelName, function (err, model) {
        
        if (err || !model) {
            return console.error('[table: ' + (err ? err.toString() : 'No model found.') + ']');
        }
        
        self.model = model;
        
        // render title
        if (self.title) {
            self.title.template.render([{title: model.name}]);
        }
        
        var templates = createTemplates(model.fields);
        
        // render header
        self.head.template.set(templates.headers);
        self.head.template.render();
        
        // render items
        self.item.template.set(templates.rows);
        model.read({q: {}, o: {}}, function (err, data) {
            
            if (err || !data) {
                data = [err] || ['no data'];
            }
            
            self.item.template.render(data);
            
            // add clicks to rows
            var rows = self.item.template.dom.getElementsByTagName('tr');
            for (var i = 0; i < rows.length; ++i) {
                rows[i].addEventListener('click', clickRowHander(self.item.state, data[i]._id), false);
            }
        });
    });
}

function getModelFromUrl (pattern) {
    var match = location.pathname.match(pattern);
    if (match && match[1]) {
        return match[1];
    }

    return;
}

function init () {
    var self = this;
    var config = self.mono.config.data;
    
    // state handler
    self.load = load;
    
    // create regexp pattern
    if (config.pattern) {
        self.pattern = new RegExp(config.pattern);
    }
    
    // init view
    if (config && config.layout) {
        var V = View(self);
        
        V.load(config.layout, function (err, layout) {
            
            if (err) {
                return;
            }
            
            // save view instance
            self.layout = layout;
            
            if (self.layout.template) {
                
                // render layout view
                self.layout.template.render();
                
                // load controller
                var count = 0;
                var handler = function (err) {
                    if (++count === 3) {
                        
                        var modelName = getModelFromUrl(config.pattern);
                        if (!modelName) {
                            return self.emit('ready');
                        }
                        
                        self.layout.model(modelName, function (err, model) {
                            
                            if (!err) {
                                
                                //add click to create button
                                var create = config.create;
                                $(create).on('click', clickRowHander(self.item.state, 'new'));
                                
                                layout.state.emit();
                            }
                            
                            self.emit('ready');
                        });
                    }
                };
                
                // load title
                if (config.title) {
                    V.load(config.title, function (err, title) {
                        self.title = title;
                        handler(err);
                    });
                } else {
                    handler();
                }
                
                // load headers
                if (config.head) {
                    V.load(config.head, function (err, head) {
                        self.head = head;
                        handler(err);
                    });
                } else {
                    self.head = {
                        model: V.model,
                        template: V.template({
                            to: 'thead',
                            in: self.layout.template.dom
                        })
                    };
                    handler();
                }
                
                // load items
                if (config.item) {
                    V.load(config.item, function (err, item) {
                        self.item = item;
                        handler(err);
                    });
                } else {
                    self.item = {
                        model: V.model,
                        state: V.state(),
                        template: V.template({
                            to: 'tbody',
                            in: self.layout.template.dom
                        })
                    };
                    handler();
                }
            }
        });
    }
}

module.exports = init;

return module;

});
