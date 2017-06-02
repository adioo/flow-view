"use strict"

// Dependencies
const DOMPurify = require('dompurify');
const events = require('./events');
const template = require('./template');

const DEFAULT_OPTIONS = {
    tmpl: "layout",
    title: "",
    position: "beforeend",
    clearList: true,
    leaveKeys: false,
    dontEscape: false,
    dontPrevent: false
};
const DEFAULT_ELEMENT_NAME = 'element';
const RENDER_ESCAPE = {'&': '&amp;', '"': '&quot;', '<': '&lt;', '>': '&gt;'};

/*
 *  Render templates
 */
module.exports = (context) => {
    return (template_name, _options, data) => {
        let self = this;

        // define options
        let options = {};
        Object.keys(DEFAULT_OPTIONS).forEach(optionName => {
            options[optionName] = _options[optionName] || DEFAULT_OPTIONS[optionName];
        });

        // check if config object for template exists
        if (!context.config.templates[template_name]) {
            return Promise.reject(new Error('Template config "' + template_name + '" not found.'));
        }

        return template(context, template_name, context.config.templates[template_name])
        .then(doRender(context, options, data));
    };
};

function doRender (self, options, data) {
    return (tmpl) => {

        // set default render options
        if (tmpl.options) {
            for (let prop in tmpl.options) {
                options[prop] = tmpl.options[prop];
            }
        }

        // set document title
        if (tmpl.title) {
            document.title = tmpl.title;
        }

        if (tmpl.render) {
            return mergeData(tmpl, options, data).then((html) => {

                if (!html) {

                    // attch events to document
                    if (tmpl.events) {
                        events.call(self, tmpl, options, document, data);
                    }

                // render html
                } else if (typeof tmpl.to === 'object') {

                    // clear html before appending
                    if (options.clearList) {
                        tmpl.to.innerHTML = '';
                    }

                    html = DOMPurify.sanitize(html);

                    // append dom events
                    if (!tmpl.events) {
                        tmpl.to.insertAdjacentHTML(options.position, html);
                    } else {
                        let tmpElm = document.createElement(tmpl.to.tagName);
                        tmpElm.innerHTML = html;

                        // setup flow event streams
                        events.call(self, tmpl, options, tmpElm, data);

                        Array.from(tmpElm.children).forEach(function (elm) {
                            tmpl.to.appendChild(elm);
                        });
                    }
                }

                return html || "";
            });
        }

        return Promise.resolve("");
    };
}

function mergeData (tmpl, options, data) {
    if (tmpl.render) {
        if (data && data instanceof Array) {
            let jobs = [];
            data.forEach(function (item) {
                jobs.push(tmpl.render(item, options, escFn));
            });
            return Promise.all(jobs).then((values) => {
                let html = "";
                values.forEach((snippet) => {
                    html += snippet;
                });
                return html;
            });
        } else {
            return tmpl.render(data, options, escFn);
        }
    }
}

/**
 * Escape html chars.
 *
 * @private
 * @param {object} The template object.
 * @param {object} The data object.
 * @param {string} The data key.
*/
function escFn (self, data, key, options) {

    let template = false;

    // check if it's a template name
    if (key.charAt(0) === "[") {
        //console.log(options)
        template = true;
        key = key.slice(1, -1);
    }

    // get the string value
    let str = key.indexOf('.') > 0 ? getPathValue(key, data) : (data[key] || null);

    // if str is null or undefined
    str = str === undefined ? (options.leaveKeys ? '{' + key + '}' : '') : str;

    if (template) {
        return render.call(self, str, options, data);
    }

    if (typeof str === 'object') {
        str = JSON.stringify(str, null, '\t');
    } else {
        str += '';
    }

    // escape html chars
    if (!options.dontEscape) {
        str = str.replace(/[&\"<>]/g, (_char) => {
            return RENDER_ESCAPE[_char];
        });
    }

    return Promise.resolve(str);
}

/**
 * Get a value from a property "path" (dot.notation).
 * path('Object.key.key.value'[, {'key': {'key': {'value': 123}}}]);
 *
 * @private
 * @param {string} The path in "dot" notation.
 * @param {array} The data objects, which are used to search the path.
 */
function getPathValue (path, scope) {

    if (!path || !scope) {
        return;
    }

    // prepare path
    path = path.split('.');

    // find keys in paths or return
    for (var i = 0; i < path.length; ++i) {
        if ((scope = scope[path[i]]) === undefined) {
            return;
        }
    }

    return scope;
}
