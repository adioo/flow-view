// template factory
module.exports = function (config, options, callback) {

    var template = (this._config.templates || {})[options.tmpl];
    if (!template) {
        return next(new Error('View.render: Template "' + options.tmpl + '" not found on instance config.'));
    }

    // set streams cache
    template.streams = template.streams || {};

    // init template
    if (typeof template.render !== 'function') {
        
        if (!this._markups[template.html]) {
            return next(new Error('View.render: Markup "' + template.html + '" not found.'));
        }

        template.render = render.create(this._markups[template.html]);

        // reset target with selector if target is removed from the document
        template.sel = template.to;
        template.obs = new MutationObserver(function (event) {
            event = event[0];
            Object.keys(event.removedNodes).forEach(function (node) {
                node = event.removedNodes[node];

                // check if template target is under the removed nodes
                if (typeof template.to !== 'string' && node.isSameNode(template.to)) {
                    template.obs.disconnect();
                    template.to = template.sel;
                }
            });
        });    
    }

    // get dom parent
    if (typeof template.to === 'string') {
        template.to = document.querySelector(template.sel);
        template.obs.observe(template.to.parentNode, {childList: true});
    }
}

// TODO load html and css
/*
    // load styles
    if (flow.styles && composition.styles) {
        flow.styles(composition.styles);
    }

    // load markup
    if (flow.markup && composition.markup) {
        ++count;
        flow.markup(composition.markup, readHandler);
    }
    // Load html snippets.
    markup: function (urls, callback) {

        var self = this;
        var count = 0;
        var snippets = {};
        var errorHappend;
        var next = function (url) {
            self.flow('M', {net: 'http', method: 'get', url: url}, function (err, snippet) {

                if (errorHappend) {
                    return;
                }

                if (err) {
                    errorHappend = true;
                    return callback(err);
                }

                snippets[url] = snippet;

                if (++count === urls.length) {
                    callback(null, snippets, true);
                }
            }).o.on('error', console.log.bind(console));
        };

        urls.forEach(next);
    },
    
    // Load css files.
    styles: function (urls) {
        urls.forEach(function (url) {
            var link = document.createElement('link');
            link.setAttribute('rel', 'stylesheet');
            link.setAttribute('href', url);
            global.document.head.appendChild(link);
        });
    },
*/

