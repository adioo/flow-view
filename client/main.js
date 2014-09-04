Z.wrap('github/ionicabizau/list/v0.0.1/client/main.js', function (require, module, exports) {

    var List = require("./list");
    var Ui = require("./ui");

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
            }
        };

        config = $.extend(self._conf, config);

        // Handle pagination
        if (config.pagination) {
            config.pagination = $.extend({
                limit: 20,
                numbers: {
                    max: 3
                }
            }, config.pagination);

        }

        var list = new List(self);
        var ui = new Ui(self);

        self.read = function (ev, data) {

            var callback = function (err, data) {
                self.emit("list_rendered", err, data);
            };

            if (typeof data === "function") {
                callback = data;
                data = ev;
                ev = null;
            }

            list.read(data.q, data.o, function (err, data) {
                if (!err) { ui.render(data); }
                callback(err, data);
            });
        };

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

            list.read(data.q, {}, function (err, data) {
                data = data && data[0];
                self.emit("item_got", err, data);
                if (typeof callback === "function") {
                    callback(err, data);
                }
            });
        };

        self.model = self.model[self._conf.model];
        if (!self.model) {
            throw new Error("Model is not loaded. Please load the model using the composition configuration");
        }

        self.view.item.on.data = self._path(config.item.on.data);

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

        ready();
    }

    module.exports = init;

    return module;
});
