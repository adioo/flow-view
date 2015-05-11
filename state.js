/**
 * Activate a state.
 *
 * @public
 * @param {object} The event object.
 * @param {object} The data object.
*/
exports.state = function (event, data) {

    // check if state exists
    if (this.tmpl && this.states[data.name]) {

        // activate state elements
        for (var i = 0, state, selector, element; i < this.states[data.name].length; ++i) {
            state = this.states[data.name][i];
            element = this.tmpl.elements[data.element || state.element];
            selector = state.sel || data.selector;

            // get dynamic or static selector
            if (!element && !selector) {

                // retrun if no selector is found
                return;
            }

            // auto hide pages before activate a state
            if (this.tmpl.page && !data.noPaging) {

                // add "hide" class to all pages
                manipulateClasses(
                  (this.tmpl.to || document).querySelectorAll('.' + this.tmpl.page),
                  {add: ['hide']}
                );
            }

            // manipulate classes
            selector = typeof selector !== 'string' ? selector : (this.tmpl.to || document).querySelectorAll(selector);
            manipulateClasses(element || selector, state);
        }
    }
};

/**
 * Manipulate css classes (add, rm, toggle).
 *
 * @private
 * @param {object} The event object.
 * @param {object} The data object.
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
