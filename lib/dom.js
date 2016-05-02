var libob = require('libobject');

module.exports = function (options, data, next) {

    if (!libob.isObject(options._)) {
        return next(new Error('View.dom: Options is not an object.'));
    }

    // get an attribute value from a dom element or the element itself
    Object.keys(options._).forEach(function (key) {

        var path = options._[key].split(':');

        // get find an element in the document
        path[0] = document.querySelector(path[0]);

        // set data key to the dom attribute value or the dom element
        data[key] = path[1] && path[0][path[1]] !== undefined ? path[0][path[1]] : path[0];
    });

    return next(null, data);
};
