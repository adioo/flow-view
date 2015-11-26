/**
 * Activate a state.
 *
 * @public
 * @param {object} The error object.
 * @param {object} The data object.
*/
module.exports = function activateState (options, data, next) {

    var state = (this._config.states || {})[options.name];
    var template = (this._config.templates || {})[options.tmpl];
    
    if (!state) {
        return next(new Error('View.state: State "' + options.name + '" not found.'));
    }

    // check options
    if (!template) {
        return next(new Error('View.state: Template "' + option.tmpl + '"not found.'));
    }

    // activate state elements
    state.forEach(function (config) {

        // call other states
        if (config.states) {
            config.states.forEach(function (stateName) {
                activateState.call(this, {name: stateName});
            });
        }

        var element;
        if (template.elements) {
            element = template.elements[options.element || state.element];
        }
        var selector = config.sel || options.selector;

        // get dynamic or static selector
        if (!element && !selector) {
            return next(new Error('View.state "' + options.name + '": DOM target not found.'));
        }

        // manipulate classes
        selector = typeof selector !== 'string' ? selector : (template.to || document).querySelectorAll(selector);
        manipulateClasses(element || selector, config);
    });

    next(null, data);
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
    for (var i = 0; i < elms.length; ++i) {

        // remove classes
        state.rm && elms[i].classList.remove.apply(elms[i].classList, state.rm);

        // add classes
        state.add && elms[i].classList.add.apply(elms[i].classList, state.add);

        // toggle classes
        state.toggle && elms[i].classList.toggle.apply(elms[i].classList, state.toggle);
    }
}
