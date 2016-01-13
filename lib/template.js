var render = require('./render');

// caches
var htmls = {};
var templates = {};

// template factory
module.exports = function (instance, config, options, callback) {

    // check template cache
    if (templates[options.tmpl]) {

        // refresh dom target, in case the target is removed from DOM
        var err = ensureDomTarget(config.to, templates[options.tmpl]);
        if (err instanceof Error) {
            callback(err);
        }

        return callback(null, templates[options.tmpl]);
    }

    // load css
    if (config.css) {
        config.css.forEach(function (url) {
            var link = document.createElement('link');
            link.setAttribute('rel', 'stylesheet');
            link.setAttribute('href', url);
            global.document.head.appendChild(link);
        });
    }

    if (!config.html) {
        return callback(new Error('View.template: No html config found.'));
    }

    // save tempalte name in config
    config.name = options.tmpl;

    // check if html snippet is already loaded
    if (htmls[config.html]) {
        return createTemplate(config, callback);

    // load html snippet
    } else {
        instance.flow('null', {net: 'http', method: 'get', url: config.html}, function (err, snippet) {

            if (err) {
                return callback(err);
            }

            htmls[config.html] = snippet;
            createTemplate(config, callback);

        }).o.on('error', callback);
    }
};

function createTemplate (config, callback) {

    var template = {
        events: config.events,
        streams: {},

        // create render function
        render: render.create(htmls[config.html]),

        // reset target with selector if target is removed from the document
        obs: new MutationObserver(function (event) {
            event = event[0];
            Object.keys(event.removedNodes).forEach(function (node) {
                node = event.removedNodes[node];

                // check if template target is in the removed nodes
                if (typeof template.to !== 'string' && node.isSameNode(template.to)) {
                    template.obs.disconnect();
                    template.to = null;
                }
            });
        })
    };

    // cache template   
    templates[config.name] = template;

    // get dom target
    var err = ensureDomTarget(config.to, template);
    if (err instanceof Error) {
        return callback(err);
    }

    // cache and return
    callback(null, template);
}

function ensureDomTarget (selector, template) {

    if (!template.to && selector) {
        template.to = document.querySelector(selector);
        if (!template.to) {
            return new Error('View.template: Target "' + selector + '" not found.');
        }

        // observe target parent, to know when target is removed from DOM
        template.obs.observe(template.to.parentNode, {childList: true});
    }
}
