Z.wrap('github/ionicabizau/list/v0.0.1/client/main.js', function (require, module, exports) {

    var Ui = require("./ui");
    var Pagination = require("./pagination");

    function init (config, ready) {
        var self = this;

        if (!self.view.layout) {
            throw new Error("A view named 'layout' is required.");
        }
        if (!self.view.item) {
            throw new Error("A view named 'item' is required.");
        }

        self.view.layout.render();

        self._conf = {
            "options": {
                "query": {},
                "options": {}
            },
            "model": "",
            "autoinit": true,
            "item": {
                "on": {
                    "data": null
                },
                "id": "_id"
            },
            "filters": "filters"
        };

        config = $.extend(self._conf, config);

        var ui = self.ui = new Ui(self);

        self.model = self.model[self._conf.model];
        if (!self.model) {
            throw new Error("Model is not loaded. Please load the model using the composition configuration");
        }

        self.view.item.on.data = self._path(config.item.on.data);

        // Handle pagination
        if (config.pagination) {
            config.pagination = $.extend({
                size: 8,
                classes: {
                    disabled: "disabled",
                    next: "next-page",
                    prev: "prev-page",
                    active: "active"
                },
                numbers: {
                    max: 3,
                    aFirst: true,
                    aLast: true
                }
            }, config.pagination);

            config.options.options.limit = config.pagination.size;
            var pagination = self.pagination = new Pagination(self);
            self.on("filtersSet", function (ev, filters) {
                self.filters = filters;
                pagination.update();
            });
        }

        /**
         * read
         * Read and renders data.
         *
         * `data` argument should contain:
         *  - `q`: the query object
         *  - `o`: the options object
         *
         * Data can be passed via `event` parameter, the second argument being used as `callback` function.
         *
         * @name read
         * @function
         */
        self.read = function (ev, data) {

            var callback = function (err, data) {
                self.emit("list_rendered", err, data);
            };

            if (typeof data === "function") {
                callback = data;
                data = ev;
                ev = null;
            }

            data = Object(data);
            self.emit({
                to: self._conf.filters,
                event: "setFilters"
            }, ev, {
                query: data.q,
                options: data.o,
                _qReset: true,
                _model: self.model
            }, function (err, data) {
                if (!err) { ui.render(data); }
                callback(err, data);
            });
        };

        /**
         * getItem
         *
         * @name getItem
         * @function
         * @param {} ev
         * @param {} callback
         * @return {undefined}
         */
        self.getItem = function (ev, callback) {

            var data = {};
            if (typeof ev === "string") {
                data.q = {};
                data.q[self._conf.item.id] = ev;
            } else if (typeof ev === "object") {
                data.q = ev;
            }

            if (typeof data.q[self._conf.item.id] === "string") {
                var cache = self.view.item.data || [];
                for (var i = 0; i < cache.length; ++i) {
                    var cCache = cache[i];
                    if (cCache[self._conf.item.id] === ev) {
                        return callback(null, cCache);
                    }
                }
            }

            // TODO
            list.read(data.q, {}, function (err, data) {
                if (data.length > 1) {
                    console.warn("Found more items, but returning the first one.");
                }
                data = data && data[0];
                self.emit("item_got", err, data);
                if (typeof callback === "function") {
                    callback(err, data);
                }
            });
        };

        self.on("ready", function () {
            if (self._conf.autoinit) {
                var req = config.options;

                self.read({
                    q: req.query,
                    o: req.options
                }, function (err, data) {
                    if (err) { return errorHandler(err); }
                    ui.render(data);
                });

            } else {
                // TODO
            }

            self.on("pageChanged", function (ev, data) {
                self.read();
            });
        });

        ready();
    }

    module.exports = init;

    return module;
});
