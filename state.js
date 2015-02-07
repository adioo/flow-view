/**
 * Activate a state.
 *
 * @public
 * @param {object} The event object.
 * @param {object} The data object.
*/
exports.state = function (event, data) {

    // get the name of the state
    var state;
    if (state = this.states[data.name]) {

        // retrun if no selector is found
        if (!state.sel) {
            return;
        }

        // get current state if no "from" state is defined
        if (!state.from) {
            state.from = {elms: this.currentState};
        }

        // handle curent state
        if (state.from && state.from.sel) {

            // get the template scope for "from" state
            if (this.tmpls[state.from.tmpl]) {
                state.from.tmpl = this.tmpls[state.from.tmpl].to;
            }

            // get dom element referecnces
            var elms_from = (state.from.tmpl || document).querySelectorAll(state.from.sel);

            // manipulate classes
            manipulateClasses(elms_from, state.from);
        }

        // get the template scope for "to" state
        if (state.tmpl && this.tmpls[state.tmpl]) {
            state.tmpl = this.tmpls[state.tmpl].to;
        }

        // get dom element referecnces
        var elms = (state.tmpl || document).querySelectorAll(state.sel);

        // manipulate classes
        manipulateClasses(elms, state);

        // set current state
        this.currentElms = elms;
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
