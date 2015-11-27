/**
 * Setup the user (DOM) event flow.
 *
 * @private
 * @param {object} The moule instnace.
*/
module.exports = function (instance, template, options, dom, data) {

    template.events.forEach(function (listener) {

        // handle element config
        if (listener.element) {
            listener.selector = "[data-element='" + listener.element + "']";
            delete listener.element;
        }

        var elms = dom.querySelectorAll(listener.selector || listener.sel);
        if (elms) {

            // create event stream
            if (!template.streams[listener.flow]) {
                template.streams[listener.flow] = instance.flow(listener.flow);
            }

            Array.from(elms).forEach(function (elm) {
                elm.addEventListener(listener.on, function (event) {

                    // dont prevent default browser actions
                    if (!listener.dontPrevent) {
                        event.preventDefault();
                    }

                    event.data = data;
                    event.template = template.to;
                    template.streams[listener.flow].write(event);
                });
            });
        }
    });
}
