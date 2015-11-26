/**
 * Setup the user (DOM) event flow.
 *
 * @private
 * @param {object} The moule instnace.
*/
function setupDomEventFlow (scope, data) {

    var self = this;

    if (!config || !config.domEvents) {
        return;
    }

    var events = config.domEvents;

    for (var i = 0, l = events.length, event, stream; i < l; ++i) {
        event = events[i];

        // handle element config
        if (event.element) {
            event.selector = "[data-element='" + event.element + "']";
            delete event.element;
        }

        var elms = scope.querySelectorAll(event.selector);
        if (elms) {
            // create event stream
            stream = self.flow(event.flow);
            stream.context = {
                renderData: data,
                dontPrevent: event.dontPrevent
            };

            for (var e = 0; e < elms.length; ++e) {
                elms[e].addEventListener(event.on, domEventListenerClosure(stream, elms, data));
            }
        }
    }
}

function domEventListenerClosure (stream, elms, data) {
    return function (event) {
        // dont prevent default browser actions
        if (!stream.context.dontPrevent) {
            event.preventDefault();
        }

        stream.write(null, {
            event: event,
            elms: elms,
            item: data
        });
    };
}
