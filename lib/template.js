var render = require('./render');

// caches
var htmls = {};
var templates = {};

// template factory
module.exports = function (instance, config, options, callback) {

    // check template cache
    var tmplCacheKey = instance._name + options.tmpl;
    if (templates[tmplCacheKey]) {

        // refresh dom target, in case the target is removed from DOM
        var err = ensureDomTarget(config.to, templates[tmplCacheKey]);
        if (err instanceof Error) {
            callback(err);
        }

        return callback(null, templates[tmplCacheKey]);
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

    // save template  name in config
    config.name = tmplCacheKey;

    // check if html snippet is already loaded
    if (!config.html || htmls[config.html]) {
        createTemplate(config, callback);

    // load html snippet
    } else {

        var error;
        fetch(config.html, {
            method: 'get',
            credentials: 'same-origin',
            mode: 'cors'
        }).then(function (response) {
            if (!response.ok) {
                error = true;
            }
            return response.text();

        }).then(function (snippet) {
            if (error) {
                callback(new Error(snippet));
            } else {

                htmls[config.html] = snippet;
                createTemplate(config, callback);
            }
        }).catch(callback);
    }
};

function createTemplate (config, callback) {

    var template = {
        events: config.events,
        streams: {},


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

    // create render function
	if (config.html) {
        template.render = render.create(htmls[config.html]);
	}

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

    if (selector) {
        template.to = document.querySelector(selector);
        if (!template.to) {
            return new Error('View.template: Target "' + selector + '" not found.');
        }

        // observe target parent, to know when target is removed from DOM
        template.obs.observe(template.to.parentNode, {childList: true});
    }
}
