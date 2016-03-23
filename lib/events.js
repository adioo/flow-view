/**
 * Setup the user (DOM) event flow.
 *
 * @private
 * @param {object} The moule instnace.
*/
module.exports = function (instance, template, options, dom, data) {
    for (var event in template.events) {
        for (var i = 0, l = template.events[event].length; i < l; ++i) {
            handleEvent(instance, template, dom, data, event, template.events[event][i]); 
        }
    };
}

function handleEvent (instance, template, dom, data, event, listener) {

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

                domEvent.data = data;
                domEvent.domItem = elm;
                domEvent.template = template.to;

                // create event stream
                var eventStream = template.streams[event];
                if (!eventStream) {
                    eventStream = instance.flow(event);
                    var handler = function (err) {
                        delete template.streams[event];
                    };

                    // cache stream
                    template.streams[event] = eventStream;

                    eventStream.on('error', handler);
                    eventStream.on('end', handler);
                    eventStream.on('data', function nirvana () {});
                }

                eventStream.write(domEvent);

                if (listener.end) {
                    eventStream.end();
                }
            });
        });
    }
}
