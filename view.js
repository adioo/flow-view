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
exports.init = function () {
    var self = this;

    self._config = self._config || {};
    // set document title
    if (self._config.title) {
        document.title = self._config.title;
    }

    this.templates = {};

    // create and render the template
    if (self._config.templates) {

        var tmpl;
        self._config.defaultTemplate = self._config.defaultTemplate || Object.keys(self._config.templates)[0];

        for (var tmplKey in self._config.templates) {
            tmpl = self._config.templates[tmplKey];

            self.templates[tmplKey] = {
                'to': tmpl.to,
                'e': tmpl.dontEscape,
                'k': tmpl.leaveKeys,
                'f': default_escape_fn,
                '_elmName': tmpl.element || default_element_name,
                'element': '[data-' + (tmpl.element || default_element_name) + ']',
                'elements': {}
            };

            // add page selector to template
            if (tmpl.pages) {
                self.templates[tmplKey].pages.page = '_page_' + self._name;
            }

            // create template function
            if (engine.markup[tmpl.html]) {
                self.templates[tmplKey].render = createTemplate(engine.markup[tmpl.html]);
            }

            // auto render template
            if (tmpl.render) {
                draw.call(self, null, { template: tmplKey, data: {} });
            }
        }
    }

    // setup states
    if (self._config.states) {

        // create states cache
        self.states = {};

        // sage state in cache
        for (var stateName in self._config.states) {
            self.states[stateName] = self._config.states[stateName];
        }
    }
};

function draw (err, renderObj) {

    var self = this;
    renderObj = renderObj || {};

    // the template must exist
    var template = self.templates[renderObj.template || self._config.defaultTemplate];
    if (!template) {
        return;
    }

    var dontEscape = !!renderObj.dontEscape;
    var leaveKeys = !!renderObj.leaveKeys;
    var clearList = !!renderObj.clear;
    var insertPosition = renderObj.position || template.position || 'beforeend';

    // prepare render data
    template.data = renderObj.data;

    // render page class name
    if (template.page) {
        template.data.page = template.page;
    }

    // create html
    template.html = template.render(renderObj.data, dontEscape, leaveKeys);

    // get dom parent
    if (typeof template.to === 'string') {
        template.to = document.querySelector(template.to);
    }

    // render html
    if (template.to) {
        if (clearList) {
            template.to.innerHTML = '';
        }

        // append dom events
        if (!self._config.flow) {
            template.to.insertAdjacentHTML(insertPosition, template.html);
        } else {
            var tmpDiv = document.createElement('div');
            tmpDiv.innerHTML = template.html;

            // TODO
            //if (template.element) {
            //    // get available elements
            //    var elements = template.to.querySelectorAll(template.element);
            //    if (elements.length) {
            //        for (var e = 0, l = elements.length; e < l; ++e) {
            //            template.elements[elements[e].dataset[template._elmName]] = elements[e];
            //        }
            //    }
            //}

            setupDomEventFlow.call(self, tmpDiv, renderObj.data);

            var children = tmpDiv.children;
            for (var i = 0, l = children.length; i < l; ++i) {
                console.log(children[0].tagName);
                template.to.appendChild(document.adoptNode(children[0]));
            }
        }
    }
}

/**
 * Render data to the HTML template.
 *
 * @public
 * @param {object} The event object.
 * @param {object} The data object.
*/
exports.render = function (stream) {
    stream.data(draw);
};

/**
 * Escape html chars.
 *
 * @private
 * @param {object} The template object.
 * @param {object} The data object.
 * @param {string} The data key.
*/
function default_escape_fn (data, key, dont_escape_html, leaveKeys) {

    // get options
    dont_escape_html = dont_escape_html || this.e;
    leaveKeys = leaveKeys || this.k;

    // get the string value
    str = key.indexOf('.') > 0 ? engine.path(key, data) : (data[key] || null);

    // if str is null or undefined
    str = str === null ? (leaveKeys ? '{' + key + '}' : '') : str;

    // render a nested view
    if (typeof str === 'object' && this.nested && this._.view[this.nested[key]]) {
        var tmpl = this.tmpls[this.nested[key]];

        // render nested view and don't append to the dom
        tmpl.render && tmpl.render(str, dont_escape_html, leaveKeys, true);

        // get html of rendered view
        str = tmpl.html || '';

        // don't escape html chars
        dont_escape_html = true;

    // make sure str is a string
    } else {
        str += '';
    }

    // escape html chars
    if (!dont_escape_html) {
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
    return new Function("_", "e", "k", "_=_||{};return '" +
        (tmpl || '').replace(/[\\\n\r']/g, function(_char) {
            return template_escape[_char];
        }).replace(/{\s*([\w\.]+)\s*}/g, "' + this.f(_,'$1',e,k) + '") + "'"
    );
}

/**
 * Setup the user (DOM) event flow.
 *
 * @private
 * @param {object} The moule instnace.
*/
function setupDomEventFlow (scope, data) {

    var self = this;

    if (!self._config || !self._config.flow) {
        return;
    }

    var flows = self._config.flow;

    for (var i = 0, l = flows.length, flow, stream; i < l; ++i) {
        flow = flows[i];
        
        //// handle element config
        //if (flow.element && template.elements[flow.element]) {
        //    var element = template.elements[flow.element];
        //    element.addEventListener(flow.on, domEventListenerClosure(stream, [element], data[0]));
        //
        //// handle selector config
        //} else {

        var elms = scope.querySelectorAll(flow.selector);
        if (elms) {
            // create event stream
            stream = self.flow(flow, {
                renderData: data,
                dontPrevent: flow.dontPrevent
            });

            for (var e = 0; e < elms.length; ++e) {
                elms[e].addEventListener(flow.on, domEventListenerClosure(stream, elms, data));
            }
        }
        //}
    }
}

function domEventListenerClosure (stream, elms, data) {
    return function (event) {
        // dont prevent default browser actions
        if (!stream.dontPrevent) {
            event.preventDefault();
        }

        stream.write(null, {
            event: event,
            elms: elms,
            item: data
        });
    };
}
