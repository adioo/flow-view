/**
 * Activate a state.
 *
 * @public
 * @param {object} The error object.
 * @param {object} The data object.
*/
exports.state = function activateState (stream, options) {

    // check options
    var template = this.t[options.tmpl];
    if (!template || !options.name || !this.s[options.name]) {
        return;
    }

    // activate state elements
    for (var i = 0, state, selector, element; i < this.s[options.name].length; ++i) {
        state = this.s[options.name][i];

        // call other states
        if (state.states) {
            for (var ii = 0, l = state.states.length; ii < l; ++ii) {
                activateState.call(this, {name: state.states[ii]});
            }
        }

        element = template.elements[options.element || state.element];
        selector = state.sel || options.selector;

        // get dynamic or static selector
        if (!element && !selector) {

            // retrun if no selector is found
            return;
        }

        // manipulate classes
        selector = typeof selector !== 'string' ? selector : (template.to || document).querySelectorAll(selector);
        manipulateClasses(element || selector, state);
    }
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
