/**
 * Instance options:
 * {
 *    templates: {
 *        name: {
 *            title: "",
 *            position: ""
 *            clearList: "",
 *            leaveKeys: true,
 *            dontEscape: false
 *       }
 *    },
 *    states: {}
 * }
 */

var render = require('./lib/render');
var state = require('./lib/state');
var events = require('./lib/events');
var defaulOptions = {
    render: {
        tmpl: "layout",
        title: "",
        position: "beforeend",
        clearList: "",
        leaveKeys: false,
        dontEscape: false,
        dontPrevent: false
    }
};

exports.state = state;

function renderDefOptions (options, data) {

    var renderOptions = {};

    for (var option in defaulOptions.render) {
        renderOptions[option] = options[option] || defaulOptions.render[option];
    }

    return renderOptions;
}

/**
 * Render data to the HTML template.
 *
 * @public
 * @param {object} The event object.
 * @param {object} The data object.
*/
exports.render = function (_options, data, next) {

    // TODO look also in data for render configs?
    var options = renderDefOptions(_options);

    // the template must exist
    var template = (this._config.templates || {})[options.tmpl];
    if (!template) {
        return next(new Error('View.render: Template "' + options.tmpl + '" not found.'));
    }

    // set streams cache
    template.streams = template.streams || {};

    // set document title
    if (template.title) {
        document.title = template.title;
    }

    if (typeof template.render !== 'function') {

        if (!this._markups[template.html]) {
            return next(new Error('View.render: Markup "' + template.html + '" not found.'));
        }

        template.render = render.create(this._markups[template.html]);
    }

    // create html
    template.html = template.render(data, options, render.escFn);

    // get dom parent
    if (typeof template.to === 'string') {
        template.to = document.querySelector(template.to);
    }

    // render html
    if (template.to) {

        // clear html before appending
        if (options.clearList) {
            template.to.innerHTML = '';
        }

        // append dom events
        if (!template.events) {
            template.to.insertAdjacentHTML(options.position, template.html);

        } else {
            var tmpElm = document.createElement(template.to.tagName);
            tmpElm.innerHTML = template.html;

            // setup flow streams
            events(this, template, options, tmpElm, data);

            Array.from(tmpElm.children).forEach(function (elm) {
                template.to.appendChild(elm);
            });
        }
    }

    next(null, data);
}
