var libob = require('libobject');

module.exports = function (options, data, next) {

    /*
        TODO create docs
        config example
        "targetKey"
    */

     // extend data with location data (hash, search, path)
    if (!location) {
        return next(new Error('Flow-tools.url: No browser environment.'));
    }

    var state = handleStateValues();

    if (typeof options._ === 'string') {
        data[options._] = state;
        return next(null, data);
    }

    next(null, state);
};


/**
 * Extend event object with location data.
 *
 * @private
 * @param {object} The event object.
 */
function handleStateValues () {

    var state = {
        url: location.pathname,
        path: location.pathname.substr(1).split('/')
    };

    // parse and append url search to data
    if (location.search) {
        state.search = searchToJSON(location.search);
    }

    // append url hash to data
    if (location.hash) {
        state.hash = location.hash.substr(1);
    }

    return state;
}

/**
 * Parse a state search string to JSON.
 * Credentials: http://snipplr.com/view/70905/search-string-to-json/
 *
 * @private
 */
function searchToJSON(search) {
    var rep = {'?':'{"','=':'":"','&':'","'};
    var s = search.replace(/[\?\=\&]/g, function(r) {
        return rep[r];
    });
    return JSON.parse(s.length? s+'"}' : "{}");
}
