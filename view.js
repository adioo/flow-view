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

    // set document title
    if (self._config.title) {
        document.title = self._config.title;
    }

    // create and render the template
    if (self._config.template) {

        var tmpl = self._config.template;

        self.tmpl = {
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
            self.tmpl.page = '_page_' + self._name;
        }

        // create template function
        self.tmpl.render = createTemplate(engine.markup[tmpl.html]);

        // auto render template
        if (tmpl.render) {
            self.render(null, {});
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

/**
 * Render data to the HTML template.
 *
 * @public
 * @param {object} The event object.
 * @param {object} The data object.
*/
exports.render = function (err, data) {

    data = data || {};

    var self = this;
    var dontEscape = data.dontEscape;
    var leaveKeys = data.leaveKeys;
    var dontAppend = data.dontAppend;
    var template;

    // check if template exists
    if (!(template = self.tmpl)) {
        return;
    }

    // preare render data
    template.data = data = data.data || [{}];

    // push a single item to an array
    if (!(data instanceof Array)) {
        data = [data];
    }

    // reset html
    template.html = '';

    // render data
    for (var i = 0, rData; i < data.length; ++i) {

        // render page class name
        if (template.page) {
            data[i].page = template.page;
        }

        // create html
        template.html += template.render(data[i], dontEscape, leaveKeys);
    }

    // get dom parent
    if (typeof template.to === 'string') {
        template.to = document.querySelector(template.to);
    }

    // render html
    if (!dontAppend && template.to) {
        template.to.innerHTML = template.html;
        
        // get available elements
        var elements = template.to.querySelectorAll(template.element);
        if (elements.length) {
            for (var e = 0, l = elements.length; e < l; ++e) {
                template.elements[elements[e].dataset[template._elmName]] = elements[e];
            }
        }
    }

    // append dom events
    if (self._config && self._config.flow) {
        setupDomEventFlow(self);
    }
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
    str = key.indexOf('.') > 0 ? engine.path(key, data) : data[key];

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
function setupDomEventFlow (instance) {
    
    if (!instance._config || !instance._config.flow) {
        return;
    }

    var domScope = instance.tmpl.to;
    var data = instance.tmpl.data;
    var scope = [domScope];
    var flows = instance._config.flow;

    // set children as scope if there is more then one data item
    if (domScope && data.length > 1 && domScope.children) {
        scope = domScope.children;
    }

    for (var i = 0, l = flows.length, flow, stream; i < l; ++i) {
        flow = flows[i];
        
        // create event stream
        stream = instance.flow(flow, {
            scope: scope,
            renderData: data,
            dontPrevent: flow.dontPrevent,
            _write: domEventAdapter
        });
        
        // handle element config
        if (flow.element && instance.tmpl.elements[flow.element]) {
            var element = instance.tmpl.elements[flow.element];
            element.addEventListener(flow.on, domEventListenerClosure(stream, [element], data[0]));
        
        // handle selector config
        } else {
        
            // overwrite scope with the document
            if (flow.scope === 'global') {
                stream.scope = [document];
            }
    
            // overwrite scope with parent
            if (flow.scope === 'parent') {
                stream.scope = [domScope];
            }
    
            for (var s = 0, elms; s < scope.length; ++s) {
                elms = flow.selector === '.' ? [scope[s]] : scope[s].querySelectorAll(flow.selector);
                if (elms) {
                    for (var e = 0; e < elms.length; ++e) {
                        elms[e].addEventListener(flow.on, domEventListenerClosure(stream, elms, data[s]));
                    }
                }
            }
        }
    }
}

function domEventListenerClosure (stream, elms, item) {
    return function (event) {
        stream.write(null, {
            event: event,
            elms: elms,
            item: item
        });
    };
}

/**
 * Extend the event object with DOM scope, elements and the data item,
 * which was rendered with to the scope.
 *
 * @private
 * @param {object} The event object.
 * @param {object} The DOM data.
 */
function domEventAdapter (err, data) {
    
    data = data || {};
    
    // add dom scope to event
    data.scope = data.scope || this.scope;

    // dont prevent default browser actions
    if (!this.dontPrevent) {
        event.preventDefault();
    }

    // add index of found elements
    data.data = data.data || this.renderData;
    
    return data;
}
