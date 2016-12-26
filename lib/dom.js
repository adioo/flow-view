"use strict"

const libob = require('libobject');

/* 
functionality: [
    'get dom element',
    'get dom element attribute value'
]
state: {
    sets: {'flat.key': dataType},
    needs: {'flat.key': dataType}
},
data: {
    sets: {'flat.key': dataType},
    needs: {'flat.key': dataType}
}
args: {
    key: 'selector:attribute'
}
*/
module.exports = (scope, state, args, data, next) => {

    if (!libob.isObject(args)) {
        return next(new Error('View.dom: Args is not an object.'));
    }

    // get an attribute value from a dom element or the element itself
    Object.keys(args).forEach((key) => {

        let path = args[key].split(':');

        // get find an element in the document
        path[0] = document.querySelector(path[0]);

        // set data key to the dom attribute value or the dom element
        data[key] = path[1] && path[0][path[1]] !== undefined ? path[0][path[1]] : path[0];
    });

    return next(null, data);
};
