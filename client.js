var DOMPurify = require('dompurify');
var template = require('./lib/template');
var render = require('./lib/render');
var state = require('./lib/state');
var events = require('./lib/events');
var url = require('./lib/url');
var defaulOptions = {
    render: {
        tmpl: "layout",
        title: "",
        position: "beforeend",
        clearList: true,
        leaveKeys: false,
        dontEscape: false,
        dontPrevent: false
    }
};

// activate states
exports.state = state;

// export url state
exports.url = url;

// render templates
exports.render = function (_options, data, next) {
    var instance = this;

    // TODO look also in the data for render configs?
    var options = renderDefOptions(_options);
    var config = (instance._config.templates || {})[options.tmpl];
    if (!config) {
        return next(new Error('View.render: Template config "' + options.tmpl + '" not found.'));
    }

    // get template
    template(instance, config, options, function (err, tmpl) {

        if (err) {
            return next(err);
        }

        // merge data to html, setup dom events and append to the DOM
        doRender(instance, tmpl, options, data);

        next(null, data);
    });
};

function doRender (instance, tmpl, options, data) {

    // set document title
    if (tmpl.title) {
        document.title = tmpl.title;
    }

    // create html
    // TODO cache rendered html if data is the same?
    var html = DOMPurify.sanitize(tmpl.render(data, options, render.escFn));

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
            var tmpElm = document.createElement(tmpl.to.tagName);
            tmpElm.innerHTML = html;

            // setup flow event streams
            events(instance, tmpl, options, tmpElm, data);

            Array.from(tmpElm.children).forEach(function (elm) {
                tmpl.to.appendChild(elm);
            });
        }
    }
}

function renderDefOptions (options, data) {

    var renderOptions = {};

    for (var option in defaulOptions.render) {
        renderOptions[option] = typeof options[option] !== 'undefined' ? options[option] : defaulOptions.render[option];
    }

    return renderOptions;
}
