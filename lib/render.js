var default_element_name = 'element';
var template_escape = {"\\": "\\\\", "\n": "\\n", "\r": "\\r", "'": "\\'"};
var render_escape = {'&': '&amp;', '"': '&quot;', '<': '&lt;', '>': '&gt;'};

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
    var str = key.indexOf('.') > 0 ? getPathValue(key, data) : (data[key] || null);

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
};

/**
 * Get a value from a property "path" (dot.notation).
 * path('Object.key.key.value'[, {'key': {'key': {'value': 123}}}]);
 *
 * @private
 * @param {string} The path in "dot" notation.
 * @param {array} The data objects, which are used to search the path.
 */
function getPathValue (path, scope) {

    if (!path || !scope) {
        return;
    }

    // prepare path
    path = path.split('.');

    // find keys in paths or return
    for (var i = 0; i < path.length; ++i) {
        if ((scope = scope[path[i]]) === undefined) {
            return;
        }
    }

    return scope;
}
