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

function clickRowHander (state, source, id) {
    return function () {
        state.emit('/editor/' + source + '/' + id);
    };
}

function load (stateConf) {
    var self = this;
    
    // state can be emitted before the view is ready
    if (!self.item) {
        return;
    }
    
    // render items
    self.item.model(getModelFromUrl(), function (err, model) {
        
        if (err || !model) {
            return;
        }
        
        self.model = model;
        
        // render title
        if (self.title) {
            self.title.template.render([{title: model.name}]);
        }
        
        var templates = createTemplates(model.schema);
        
        // render header
        if (self.head) {
            self.head.template.set(templates.headers);
            self.head.template.render();
        }
        
        if (self.item) {
            self.item.template.set(templates.rows);
            model.read({q: {}, o: {}}, function (err, data) {
                
                if (err || !data) {
                    data = [err] || ['no data'];
                }
                
                self.item.template.render(data);
                
                // add clicks to rows
                var rows = self.item.template.dom.querySelectorAll('tr');
                for (var i = 0; i < rows.length; ++i) {
                    rows[i].addEventListener('click', clickRowHander(self.item.state, self.model.name, data[i]._id), false);
                }
            });
        }
 
        //add click to create button
        var create = self.mono.config.data.create;
        $(create).addEventListener('click', self.emit('state', stateConf.createAction + self.model.name + '/new' );
    });
}

function getModelFromUrl (model) {
    return location.pathname.split('/')[2];
}

function init () {
    var self = this;
    var config = self.mono.config.data;
    
    // state handler
    self.load = load;
    
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
                        self.layout.model(getModelFromUrl(), function (err, model) {
                            
                            if (!err) {
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
                    handler();
                }
                
                // load items
                if (config.item) {
                    V.load(config.item, function (err, item) {
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
