'use strict';

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
 *
 *
 */
module.exports = function (_options, callback) {
    let self = this;
    let data = _options.data || {};

    // define options
    let options = {};
    Object.keys(DEFAULT_OPTIONS).forEach(optionName => {
        options[optionName] = _options[optionName] || DEFAULT_OPTIONS[optionName];
    });

    // check if config object for template exists
    if (!self.config.templates[options.tmpl]) {
        return callback(new Error('Template config "' + options.tmpl + '" not found.'))
    }

    // get template
    template.call(self, options.tmpl, self.config.templates[options.tmpl], (err, tmpl) => {

        if (err) {
            return callback(err);
        }

        doRender.call(self, tmpl, options, data);
        callback(null);
    });
};

function doRender (tmpl, options, data) {
    let self = this;

    // set document title
    if (tmpl.title) {
        document.title = tmpl.title;
    }

    let html;

    // create html
    // TODO cache rendered html if data is the same?
    if (tmpl.render) {
        if (data && data instanceof Array) {
            html = '';
            data.forEach(function (item) {
                // html += DOMPurify.sanitize(tmpl.render(item, options, escFn));
                html += tmpl.render(item, options, escFn);
            });
        } else {
            // html = DOMPurify.sanitize(tmpl.render(data, options, escFn));
            html = tmpl.render(data, options, escFn);
        }
    }

    if (!html) {
        if (tmpl.events) {
            events.call(self, tmpl, options, document, data);
        }
        return;
    }

    // render html
    if (typeof tmpl.to === 'object') {

        // clear html before appending
        if (options.clearList) {
            tmpl.to.innerHTML = '';
        }

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
}

/**
 * Escape html chars.
 *
 * @private
 * @param {object} The template object.
 * @param {object} The data object.
 * @param {string} The data key.
*/
function escFn (data, key, options) {
    // get the string value
    var str = key.indexOf('.') > 0 ? getPathValue(key, data) : (data[key] || null);

    // if str is null or undefined
    str = str === null ? (options.leaveKeys ? '{' + key + '}' : '') : str;

    if (typeof str === 'object') {
        str = JSON.stringify(str, null, '\t');
    } else {
        str += '';
    }

    // escape html chars
    if (!options.dontEscape) {
        return str.replace(/[&\"<>]/g, (_char) => {
            return RENDER_ESCAPE[_char];
        });
    }

    return str;
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
