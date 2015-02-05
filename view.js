
var template_escape = {"\\": "\\\\", "\n": "\\n", "\r": "\\r", "'": "\\'"};
var render_escape = {'&': '&amp;', '"': '&quot;', '<': '&lt;', '>': '&gt;'};

/**
 * Initialize the View module instance.
 *
 * @public
 * @param {object} The event object.
 * @param {object} The data object.
*/
exports.factory = function (event, data) {
    var self = this;

    // append custom handlers
    this.handlers = {};
    if (config.on) {
        for (var name in config.on) {
            this.handlers[name] = engine.path(config.on[name]);
        }
    }

    // set html template
    // TODO maybe move this to render function
    if (config.html) {
        view.tpl = createTemplate(config.html);
        view.scope = config['in'];
        view.dom = config.to;
    }
}

/**
 * Render data to the HTML template.
 *
 * @public
 * @param {object} The event object.
 * @param {object} The data object.
*/
exports.render = function (event, data) {

    var self = this;
    var escape_fn;
    var dontEscape = data.dontEscape;
    var leaveKeys = data.leaveKeys;
    var dontAppend = data.dontAppend;

    // check if a template exists
    if (!self.tpl) {
        return;
    }

    self.html = '';
    self.data = data = data || [{}];

    // push a single item to an array
    if (!(data instanceof Array)) {
        data = [data];
    }

    // render data
    for (var i = 0, rData; i < data.length; ++i) {

        // change data before it gets rendered to the html
        if (typeof self.handlers.data === 'function') {
            rData = self.handlers.data.call(self, data[i]) || data[i];
        }

        // create html
        self.html += self.tpl(rData || data[i], default_escape_fn, dontEscape || self._config.dontEscape, leaveKeys || self._config.leaveKeys);
    }

    // change html before writing it to the dom
    if (typeof self.handlers.html === 'function') {
        self.html = self.handlers.html(self.html) || self.html;
    }

    if (typeof self.dom === 'string') {
        self.dom = (self.scope || document).querySelector(self.dom);
    }

    // render html
    if (!dontAppend && self.dom) {
        self.dom.innerHTML = self.html;
    }

    // append dom events
    if (self._extFlow) {
        setupDomEventFlow(self);
    }

    // change html before writing it to the dom
    if (typeof self.handlers.done === 'function') {
        self.handlers.done(self);
    }

    /**
     * This event is emitted, after successfull rendering.
     *
     * @event jillix/layout#renderDone
     * @type {object}
     */
    self.emit('renderDone', event, data);
};

/**
 * Escape html chars.
 *
 * @private
 * @param {string} The data object.
 * @param {string} The data key.
 * @param {boolean} Dont escape HTML chars.
 * @param {boolean} Leave the data keys in the HTML.
*/
function default_escape_fn (data, key, dont_escape_html, leaveKeys) {

    // get the string value
    str = key.indexOf('.') > 0 ? engine.path(key, data) : data[key];

    // if str is null or undefined
    str = str == null ? (leaveKeys ? key : '') : str;

    // render a nested view
    if (typeof str === 'object' && this.nested && this._.view[this.nested[key]]) {
        var view = engine.modules[this.nested[key]];

        // render nested view and don't append to the dom
        view.render && view.render(str, dont_escape_html, leaveKeys, true);

        // get html of rendered view
        str = view.html || '';

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
    return new Function("_", "f", "e", "k", "_=_||{};return '" +
        (tmpl || '').replace(/[\\\n\r']/g, function(_char) {
            return template_escape[_char];
        }).replace(/{\s*([\w\.]+)\s*}/g, "' + f.call(this,_,'$1',e,k) + '") + "'"
    );
}

/**
 * Setup the user (DOM) event flow.
 *
 * @private
 * @param {object} The moule instnace.
*/
function setupDomEventFlow (module_instance) {

    var domScope = module_instance.dom;
    var data = module_instance.data;
    var config = module_instance._extFlow;
    var scope = [domScope];

    // set children as scope if there is more then one data item
    if (domScope && data.length > 1 && domScope.children) {
        scope = domScope.children;
    }

    for (var i = 0, flow; i < config.length; ++i) {
        flow = config[i];

        // overwrite scope with the document
        if (flow.scope === 'global') {
            scope = [document];
        }

        // overwrite scope with parent
        if (flow.scope === 'parent') {
            scope = [domScope];
        }

        for (var s = 0, elms; s < scope.length; ++s) {
            elms = flow.selector === '.' ? [scope[s]] : scope[s].querySelectorAll(flow.selector);
            if (elms) {
                for (var e = 0; e < elms.length; ++e) {

                    elms[e].addEventListener(
                        flow['in'],
                        engine.flow(
                            module_instance,
                            flow.out,
                            {
                                handler: domEventAdapter,
                                data: {
                                    scope: scope[s],
                                    data: data[s],
                                    elms: elms,
                                    dontPrevent: flow.dontPrevent
                                }
                            }
                        )
                    );
                }
            }
        }
    }
}

/**
 * Extend the event object with DOM scope, elements and the data item,
 * which was rendered with to the scope.
 *
 * @private
 * @param {object} The event object.
 * @param {object} The DOM data.
 */
function domEventAdapter (event, DOM) {

    // add dom scope to event
    event._scope = event._scope || DOM.scope;

    // dont prevent default browser actions
    if (!DOM.dontPrevent) {
        event.preventDefault();
    }

    // add found elements to event
    event._elms = DOM.elms;

    // add index of found elements
    event._item = event._item || DOM.data;
}
