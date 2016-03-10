var defaultOptions = {
    state: {
        name: null,
        selector: null,
        element: null,
        tmpl: 'layout'
    }
};

/**
 * Activate a state.
 *
 * @public
 * @param {object} The error object.
 * @param {object} The data object.
*/
module.exports = function activateState (_options, data, next) {
    var self = this;

    // merge default options
    var options = defOptions(_options, data);

    var state = (this._config.states || {})[options.name];
    var template = (this._config.templates || {})[state.tmpl || 'layout'];
    
    if (!state) {
        return next(new Error('View.state: State "' + options.name + '" not found.'));
    }

    // check options
    if (!template) {
        return next(new Error('View.state: Template "' + options.tmpl + '" not found.'));
    }

    // get dom parent
    if (typeof template.to === 'string') {
        var templateDOM = document.querySelector(template.to);
    }

    // activate state elements
    var error = null;
    state.forEach(function (config) {

        // call other states
        if (config.states) {
            var nextFn = function () {};
            config.states.forEach(function (stateName) {
                activateState.call(self, {name: stateName}, data, nextFn);
            });
        }

        var selector = config.sel || options.selector;
        // handle element config
        var element = config.element || options.element;
        if (element && !selector) {
            selector = "[data-element='" + element + "']";
        }

        // return with error if state has no selector
        if (!selector) {
            error = new Error('View.state "' + options.name + '": DOM target not found.');
            return;
        }

        // manipulate classes
        selector = typeof selector !== 'string' ? selector : (templateDOM || document).querySelectorAll(selector);
        manipulateClasses(selector, config);
    });

    next(error, data);
};

/**
 * Define state options
 *
 * @private
*/
function defOptions (options, data) {

    var stateOptions = {};

    for (var option in defaultOptions.state) {
        stateOptions[option] = options[option] || data[option] || defaultOptions.state[option];
    }

    return stateOptions;
}

/**
 * Manipulate css classes (add, rm, toggle).
 *
 * @private
*/
function manipulateClasses (elms, state) {

    if (!(elms instanceof NodeList)) {
        elms = [elms];
    }

    // manipulate classes
    for (var i = 0; i < elms.length; ++i) {

        // remove classes
        if (state.rm) {
            elms[i].classList.remove.apply(elms[i].classList, state.rm);
        }

        // add classes
        if (state.add) {
            elms[i].classList.add.apply(elms[i].classList, state.add);
        }

        // toggle classes
        if (state.toggle) {
            elms[i].classList.toggle.apply(elms[i].classList, state.toggle);
        }
    }
}
