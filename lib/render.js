/**
 * Create a template function.
 * Heavily inspired by the https://github.com/muut/riotjs render method.
 *
 * @private
 * @param {string} The HTML string.
*/
exports.create = function createTemplate (tmpl) {
    return new Function("_", "o", "e", "return '" +
        (tmpl || '').replace(/[\\\n\r']/g, function(_char) {
            return template_escape[_char];
        }).replace(/{\s*([\w\.]+)\s*}/g, "' + e(_,'$1',o) + '") + "'"
    );
};

/**
 * Escape html chars.
 *
 * @private
 * @param {object} The template object.
 * @param {object} The data object.
 * @param {string} The data key.
*/
exports.escFn = function default_escape_fn (data, key, options) {

    // get the string value
    str = key.indexOf('.') > 0 ? engine.path(key, data) : (data[key] || null);

    // if str is null or undefined
    str = str === null ? (options.leaveKeys ? '{' + key + '}' : '') : str;

    if (typeof str === 'object') {
        str = JSON.stringify(str, null, '\t');
    } else {
        str += '';
    }

    // escape html chars
    if (!options.dontEscape) {
        return str.replace(/[&\"<>]/g, function(_char) {
            return render_escape[_char];
        });
    }

    return str;
}

