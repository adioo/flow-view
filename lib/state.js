const DEFAULT_OPTIONS = {
    name: null,
    selector: null,
    element: null,
    tmpl: 'layout'
};

/**
 * Activate a state.
 *
 * @public
*/
module.exports = function activateState (_options, callback) {
    let self = this;

    // define options
    let options = {};
    Object.keys(DEFAULT_OPTIONS).forEach(optionName => {
        options[optionName] = _options[optionName] || DEFAULT_OPTIONS[optionName];
    });

    // state must exist
    let state = self.config.states[options.name];
    if (!state) {
        return callback(new Error('State "' + options.name + '" not found.'));
    }

    // activate state elements
    state.forEach(function (config) {

        // call other states
        if (config.states) {
            let nextFn = function () {};
            config.states.forEach(function (stateName) {
                activateState.call(self, { name: stateName }, nextFn);
            });
        }

        let selector = config.sel || options.selector;
        // handle element config
        let element = config.element || options.element;
        if (element && !selector) {
            selector = "[data-element='" + element + "']";
        }

        // return with error if state has no selector
        if (selector) {
            selector = typeof selector !== 'string' ? selector : (document).querySelectorAll(selector);

            // manipulate classes
            if (config.add || config.toggle || config.rm) {
                manipulateClasses(selector, config);
            }

            // manipulate attributes
            if (config.attr || config.rmAttr) {
                manipulateAttributes(selector, config);
            }

            // manipulate properties
            if (config.prop) {
                manipulateProperties(selector, config);
            }
        }
    });
};

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
    for (let i = 0; i < elms.length; ++i) {

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

/**
 * Manipulate element attributes (attr, rmAttr).
 *
 * @private
*/
function manipulateAttributes (elms, state) {

    if (!(elms instanceof NodeList)) {
        elms = [elms];
    }

    // manipulate attributes
    for (let i = 0; i < elms.length; ++i) {

        // set attribute
        if (state.attr) {
            state.attr.forEach(function (attribute) {
                if (typeof attribute.name !== 'undefined' && typeof attribute.value !== 'undefined')
                elms[i].setAttribute(attribute.name, attribute.value);
            });
        }

        // remove attribute
        if (state.rmAttr) {
            state.setAttribute.forEach(function (attribute) {
                elms[i].removeAttribute(attribute);
            });
        }
    }
}

/**
 * Manipulate element properties (prop).
 *
 * @private
*/
function manipulateProperties (elms, state) {

    if (!(elms instanceof NodeList)) {
        elms = [elms];
    }

    // manipulate properties
    for (let i = 0; i < elms.length; ++i) {

        // set prop
        if (state.prop) {
            for (let prop in state.prop) {
                if (!state.prop.hasOwnProperty(prop)) {
                    continue
                }

                elms[i][prop] = state.prop[prop];
            }
        }
    }
}
