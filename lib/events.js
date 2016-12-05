/**
 * Setup the user (DOM) event flow.
 *
 * @private
 * @param {object} The moule instnace.
*/
module.exports = function (scope, instance, template, options, dom, data) {
    for (var event in template.events) {
        for (var i = 0, l = template.events[event].length; i < l; ++i) {
            handleEvent(scope, instance, template, dom, data, event, template.events[event][i]); 
        }
    }
};

function handleEvent (scope, instance, template, dom, data, event, listener) {

    // handle element config
    if (listener.element) {
        listener.selector = "[data-element='" + listener.element + "']";
        delete listener.element;
    }

    var elms = dom.querySelectorAll(listener.selector || listener.sel);
    if (elms) {

        Array.from(elms).forEach(function (elm) {
            elm.addEventListener(listener.on, function (domEvent) {

                // dont prevent default browser actions
                if (!listener.dontPrevent) {
                    domEvent.preventDefault();
                }

                domEvent.domItem = elm;

                scope.flow(instance._name + '/' + event)[listener.end ? 'end' : 'write'](listener.noDomData ? {} : domEvent);
            });
        });
    }
}
