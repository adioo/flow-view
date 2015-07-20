/**
 * Activate a state.
 *
 * @public
 * @param {object} The error object.
 * @param {object} The data object.
*/
exports.state = function activateState (stream) {
    stream.data([this, function (err, data) {

        var template = this.templates[data.template || this._config.defaultTemplate];

        // check if state exists
        if (template && this.states[data.name]) {

            // activate state elements
            for (var i = 0, state, selector, element; i < this.states[data.name].length; ++i) {
                state = this.states[data.name][i];
                element = template.elements[data.element || state.element];
                selector = state.sel || data.selector;

                // get dynamic or static selector
                if (!element && !selector) {

                    // retrun if no selector is found
                    return;
                }

                // auto hide pages before activate a state
                if (template.page && !data.noPaging) {

                    // add "hide" class to all pages
                    manipulateClasses(
                      (template.to || document).querySelectorAll('.' + template.page),
                      {add: ['hide']}
                    );
                }

                // call other states
                if (state.states) {
                    for (var s = 0, l = state.states.length; i < l; ++i) {
                        activateState.call(this, err, {name: state.states[i]});
                    }
                }

                // manipulate classes
                selector = typeof selector !== 'string' ? selector : (template.to || document).querySelectorAll(selector);
                manipulateClasses(element || selector, state);
            }
        }
    }]);
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
