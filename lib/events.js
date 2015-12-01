/**
 * Setup the user (DOM) event flow.
 *
 * @private
 * @param {object} The moule instnace.
*/
module.exports = function (instance, template, options, dom, data) {

    for (var event in templates.events) {
        var listener = templates.events[event];

        // handle element config
        if (listener.element) {
            listener.selector = "[data-element='" + listener.element + "']";
            delete listener.element;
        }

        var elms = dom.querySelectorAll(listener.selector || listener.sel);
        if (elms) {

            // create event stream
            if (!template.streams[event]) {
                template.streams[event] = instance.flow(event);
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
    };
}
