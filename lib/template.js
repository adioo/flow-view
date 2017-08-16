'use strict';

const TEMPLATE_ESCAPE = {"\\": "\\\\", "\n": "\\n", "\r": "\\r", "'": "\\'"};

// template factory
module.exports = function (name, config, callback) {
    let self = this;

    // check template cache
    let tmplCacheKey = self._name + name;
    if (self.templates[tmplCacheKey]) {

        // refresh dom target, in case the target is removed from DOM
        let err = ensureDomTarget(config.to, self.templates[tmplCacheKey]);
        if (err instanceof Error) {
            return callback(err);
        }

        return callback(null, self.templates[tmplCacheKey]);
    }

    // load css
    if (config.css) {
        config.css.forEach(function (url) {
            let link = document.createElement('link');
            link.setAttribute('rel', 'stylesheet');
            link.setAttribute('href', url);
            global.document.head.appendChild(link);
        });
    }

    // save template  name in config
    config.name = tmplCacheKey;

    // check if html snippet is already loaded
    if (!config.html || self.htmls[config.html]) {
        createTemplate.call(self, config, callback);
    // load html snippet
    } else {

        let error;
        fetch(self.config.static + config.html, {
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

                self.htmls[config.html] = snippet;
                createTemplate.call(self, config, callback);
            }
        }).catch(callback);
    }
};

/**
 * Create a template function.
 * Heavily inspired by the https://github.com/muut/riotjs render method.
 *
 * @private
 * @param {string} The HTML string.
*/
function create (tmpl) {
    return new Function("_", "o", "e", "return '" +
        (tmpl || '').replace(/[\\\n\r']/g, function(_char) {
            return TEMPLATE_ESCAPE[_char];
        }).replace(/{\s*([\w\.]+)\s*}/g, "' + e(_,'$1',o) + '") + "'"
    );
}

function createTemplate (config, callback) {
    let self = this;

    let template = {
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
        template.render = create(self.htmls[config.html]);
	}

    // cache template
    self.templates[config.name] = template;

    // get dom target
    let err = ensureDomTarget(config.to, template);
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
