Z.wrap('github/jillix/table/v0.0.1/table.js', function (require, module, exports) {

module.exports = init;

/*
    type: constructor
*/
function init (config, ready) {
    var self = this;

    // append load handler
    self.load = load;
    self.renderData = renderData;

    // event interface
    self.on('load', load);
    self.on('renderData', renderData);

    // render layout
    if (self.view && self.view.layout) {
        self.view.layout.render();
    }

    // a table can have only one model
    if (self.model) {
        for (var model in self.model) {
            self.model = self.model[model];
            break;
        }
    } else {
        self.model = {};
    }

    // get an empty view instance for the table headers
    self._load('V', {to: ''}, function (err, view) {

        self.view.head = view;

        console.log('table:', self._name);
        ready();
    });
}

/*
    type: private
*/
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

/*
    type: actor
*/
function load (event, data) {
    var self = this;
    var viewInfo = data.view;

    // reset current item
    self.currentItem = null;

    if (!self.view.item && !viewInfo) {
        return console.error('[table: ' + 'No item view.]');
    }

    // reset headers
    if (self.view.head.dom) {
        self.view.head.dom.innerHTML = '';
    }

    // TODO fetch view with view info or render direct on self.view.item
    // TODO handle title (...see editor module)
    // self.view.title.render([{title: self.view.item.config.title}]);

    if (viewInfo) {
        // TODO fetch view from server
    } else {
        // mongodb model request
        self.model.req({m: 'find', d: self.view.item.config.req || {}}, function (err, data) {

            // create templates from view config
            var templates = createTemplates(self.view.item.config.columns);

            // set header template
            self.view.head.set(templates.headers, 'thead', self.view.layout.dom);

            self.view.head.render();
            self.view.item.render(data);
        });
    }
}

/*
    type: actor
*/
function renderData (event, data) {
    var self = this;
    data = data.data;

    if (event.err || !data) {
        return;
    }

    self.model.data = data;

    // create templates from view config
    var templates = createTemplates(self.view.item.config.columns);

    // set header template
    self.view.head.set(templates.headers, 'thead', self.view.layout.dom);

    self.view.head.render();
    self.view.item.render(data);
}

return module;

});
