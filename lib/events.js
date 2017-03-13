/**
 * Setup the user (DOM) event flow.
 *
 * @private
 * @param {object} The moule instnace.
*/
module.exports = function (template, options, dom, data) {
    let self = this;

    for (let event in template.events) {
        for (var i = 0, l = template.events[event].length; i < l; ++i) {
            handleEvent.call(self, template, dom, data, event, template.events[event][i]);
        }
    }
};

function handleEvent (template, dom, data, event, listener) {
    let self = this;

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

                self.emit('DOMevent', {
                    name: event,
                    data: domEvent
                });
            });
        });
    }
}