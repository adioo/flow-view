'use strict';

const TEMPLATE_ESCAPE = {"\\": "\\\\", "\n": "\\n", "\r": "\\r", "'": "\\'"};

// template factory
module.exports = function (self, name, config) {

    // check template cache
    let tmplCacheKey = self._name + name;
    if (self.templates[tmplCacheKey]) {

        // refresh dom target, in case the target is removed from DOM
        return ensureDomTarget(config.to, self.templates[tmplCacheKey])
        .then(() => {
            return self.templates[tmplCacheKey];
        });
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
        return createTemplate(self, config);

    // load html snippet
    } else {

        let error;
        return fetch(config.html, {
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
                return Promise.reject(new Error(snippet));
            }

            self.htmls[config.html] = snippet;
            return createTemplate(self, config);
        });
    }
};

/**
 * Create a template function.
 * Heavily inspired by the https://github.com/muut/riotjs render method.
 *
 * @private
 * @param {string} The HTML string.
*/
function create (self, tmpl) {
    return (data, options, escape) => {

        let res = tmpl.match(/{\s*([\[\]\w\.]+)\s*}/g);
        if (res === null) {
            return Promise.resolve(tmpl);
        }

        let jobs = [];
        let html = tmpl;
        if (res instanceof Array) {
            res.forEach((field) => {
                jobs.push(
                    escape(self, data, field.slice(1, -1), options)
                    .then((value) => {
                        html = html.replace(field, value);
                    })
                );
            })
        }
        return Promise.all(jobs).then(() => {
            return html;
        });
    };
}

function createTemplate (self, config) {

    let template = {
        events: config.events,
        streams: {},
        options: config.options,

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
        template.render = create(self, self.htmls[config.html]);
	}

    // cache template
    self.templates[config.name] = template;

    // get dom target
    return ensureDomTarget(config.to, template).then(() => {
        return template;
    });
}

function ensureDomTarget (selector, template) {

    if (selector) {
        template.to = document.querySelector(selector);
        if (!template.to) {
            return Promise.reject(new Error('View.template: Target "' + selector + '" not found.'));
        }

        // observe target parent, to know when target is removed from DOM
        template.obs.observe(template.to.parentNode, {childList: true});
    }

    return Promise.resolve();
}
