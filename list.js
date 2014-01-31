M.wrap('github/jillix/list/v0.0.1/list.js', function (require, module, exports) {

var Bind = require('github/jillix/bind/v0.0.1/bind');

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

function load () {
    var self = this;
    
    // render header
    if (self.model) {
        
        // render title
        if (self.title) {
            self.title.view.render([{title: self.model.name}]);
        }
        
        // render items
        if (self.item) {
            self.item.crud.read({s: 'schemas', q: {_id: self.model.schema}}, function (err, schema) {
                
                if (err || !schema || !schema[0]) {
                    return;
                }
                
                var templates = createTemplates(schema[0].fields);
                
                // render header
                if (self.head) {
                    self.head.view.setTemplate(templates.headers);
                    self.head.view.render();
                }
                
                self.item.view.setTemplate(templates.rows);
                self.item.crud.read({s: self.model._id, q: {}, o: {}}, function (err, data) {
                    
                    if (err || !data) {
                        data = [err] || ['no data'];
                    }
                    
                    self.item.view.render(data);
                    
                    // add clicks to rows
                    var rows = self.item.view.dom.querySelectorAll('tr');
                    for (var i = 0; i < rows.length; ++i) {
                        rows[i].addEventListener('click', clickRowHander(self.item.state, self.model._id, data[i]._id), false);
                    }
                });
            });
        }
    } else {
        // reset rows and header
        if (self.title) {
            self.title.view.render([{}]);
        }
        
        if (self.item) {
            self.item.view.setTemplate('');
            self.item.view.render([{}]);
        }
        
        if (self.title) {
            self.head.view.setTemplate('');
            self.head.view.render([{}]);
        }
    }
}

function setModel (model) {
    this.model = model;
}

function init () {
    var self = this;
    var config = self.mono.config.data;
    
    // state handler
    self.load = load;
    
    // listen to model event
    self.on('model', setModel);
    
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
                        
                        // TODO get model from url on init
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
