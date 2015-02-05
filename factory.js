/*
var fs = require('fs');
var fingerprint = require(env.Z_PATH_UTILS + 'fingerprint');
var snippetCache = cache.file('snippets', {wd: env.Z_PATH_PROCESS_MARKUP, noCompression: true});

module.exports = factoryService;

function factory (name, role, callback) {
    var self = this;

    // check cache
    var view = compViews.pojo.get(name, role);

    // handle no access
    if (view === 0) {
        return callback(new Error('View ' + name + ' not found.'));
    }

    // return view from cache
    if (view) {
        return callback(null, view);
    }

    // get system store to fetch models
    compViews.get(name, role, function (err, view, viewChanged) {

        if (err || !view) {
            return callback(err || new Error('View ' + name + ' not found.'));
        }

        // save roles in view
        view._roles = view.roles;

        // add commit ids to css files
        fingerprint.addToFiles(null, view.css || [], function (err, css) {

            if (err) {
                return callback(err);
            }

            // update css
            if (css) {
                view.css = css;
            }

            if (!view.html) {

                // save view in cache
                compViews.pojo.set(name, view);

                return callback(null, view);
            }

            var path = view.html.replace(/[^a-z0-9\/\.\-_]|\.\.\//gi, '');
            snippetCache.set(path, function (err, snipped) {

                if (err) {
                    return callback(err);
                }

                // add snipped to view
                view.html = snipped.data.toString('utf8');

                // remove view on snippet change
                if (!viewChanged) {
                    snippetCache.obs.once('change:' + path, function () {
                        compViews.rm(name, role);
                    });
                }

                // save view in cache
                compViews.pojo.set(name, view);

                callback(null, view);
            });
        });
    });
}
*/