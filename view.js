// TODO Options
// TODO Elements
// TODO DOM events
// TODO states

var state = require('./state');

var default_element_name = 'element';
var template_escape = {"\\": "\\\\", "\n": "\\n", "\r": "\\r", "'": "\\'"};
var render_escape = {'&': '&amp;', '"': '&quot;', '<': '&lt;', '>': '&gt;'};

exports.state = state.state;

/**
 * Initialize the View module instance.
 *
 * @public
*/
exports.init = function (config, ready) {
    var self = this;
    config = config || {};

    // instances template cache
    this.t = {};

    // create and render the template
    if (config.templates) {

        var tmpl;
        var html;

        for (var tmplName in config.templates) {
            tmpl = config.templates[tmplName];
            html = self._markups[tmpl.html];

            // create template function
            if (!html) {
                return self.log('E', 'Template markup "' + tmpl.html + '" not found.');
            }

            // create template on instance
            self.t[tmplName] = {
                to: tmpl.to,
                render: createTemplate(html)
            };

            // auto render template
            if (tmpl.render) {
                render.call(self, function () {}, {tmpl: tmplName});
            }
        }
    }

    // setup states
    if (config.states) {

        // instances states cache
        self.s = {};

        // sage state in cache
        for (var stateName in config.states) {
            self.s[stateName] = config.states[stateName];
        }
    }

    ready();
};

/**
 * Render data to the HTML template.
 *
 * @public
 * @param {object} The event object.
 * @param {object} The data object.
*/
exports.render = render;

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
var defaulOptions = {
    render: {
        template: "layout",
        title: "",
        position: "beforeend",
        clearList: "",
        leaveKeys: false,
        dontEscape: false
    }
};
function renderDefOptions (options, data) {

    for (var option in defaulOptions.render) {
        if (options[option] === undefined) {
            options[option] = defaulOptions.render[option];
        }
    }

    return options;
}

function render (next, options, data, justRender) {

    var self = this;

    //TEMPORARAY
    if (!justRender && data instanceof Uint8Array) {
        data = JSON.parse(data.toString());
        if (data instanceof Array) {
            data.forEach(function (item) {
                render.call(self, next, options, item, true);
            });
            next();
        }
        return;
    }
    


    var instance = this;
    options = renderDefOptions(options);

    // configs
    // 1 data with options config (case: options.data, case: data)
    // 2 options config
    // 3 instance config
    // TODO: merge default configs

    // the template must exist
    var template = self.t[options.tmpl];
    if (!template) {
        return next(new Error('View.render: Template "' + options.tmpl + '" not found.'));
    }

    // set document title
    if (template.title) {
        document.title = template.title;
    }

    // TODO implement those options:
    //var dontEscape = !!options.dontEscape;
    //var leaveKeys = !!options.leaveKeys;
    //var clearList = options.clearList;
    //var position = options.position || template.position || 'beforeend';

    // create html
    template.html = template.render(data, options, default_escape_fn);

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

            //setupDomEventFlow.call(self, tmpElm, renderObj.data);

            var children = tmpElm.children;
            for (var i = 0, l = children.length; i < l; ++i) {
                template.to.appendChild(document.adoptNode(children[0]));
            }
        }
    }

    !justRender && next(null, data);
}

/**
 * Setup the user (DOM) event flow.
 *
 * @private
 * @param {object} The moule instnace.
*/
function setupDomEventFlow (scope, data) {

    var self = this;

    if (!config || !config.domEvents) {
        return;
    }

    var events = config.domEvents;

    for (var i = 0, l = events.length, event, stream; i < l; ++i) {
        event = events[i];

        // handle element config
        if (event.element) {
            event.selector = "[data-element='" + event.element + "']";
            delete event.element;
        }

        var elms = scope.querySelectorAll(event.selector);
        if (elms) {
            // create event stream
            stream = self.flow(event.flow);
            stream.context = {
                renderData: data,
                dontPrevent: event.dontPrevent
            };

            for (var e = 0; e < elms.length; ++e) {
                elms[e].addEventListener(event.on, domEventListenerClosure(stream, elms, data));
            }
        }
    }
}

function domEventListenerClosure (stream, elms, data) {
    return function (event) {
        // dont prevent default browser actions
        if (!stream.context.dontPrevent) {
            event.preventDefault();
        }

        stream.write(null, {
            event: event,
            elms: elms,
            item: data
        });
    };
}

/**
 * Escape html chars.
 *
 * @private
 * @param {object} The template object.
 * @param {object} The data object.
 * @param {string} The data key.
*/
function default_escape_fn (data, key, options) {

    // get the string value
    str = key.indexOf('.') > 0 ? engine.path(key, data) : (data[key] || null);

    // if str is null or undefined
    str = str === null ? (options.leaveKeys ? '{' + key + '}' : '') : str;

    if (typeof str === 'object') {
        str = JSON.stringify(str, null, '\t');
    } else {
        str += '';
    }

    // escape html chars
    if (!options.dontEscape) {
        return str.replace(/[&\"<>]/g, function(_char) {
            return render_escape[_char];
        });
    }

    return str;
}

/**
 * Create a template function.
 * Heavily inspired by the https://github.com/muut/riotjs render method.
 *
 * @private
 * @param {string} The HTML string.
*/
function createTemplate (tmpl) {
    return new Function("_", "o", "e", "return '" +
        (tmpl || '').replace(/[\\\n\r']/g, function(_char) {
            return template_escape[_char];
        }).replace(/{\s*([\w\.]+)\s*}/g, "' + e(_,'$1',o) + '") + "'"
    );
}
