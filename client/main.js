Z.wrap('github/ionicabizau/list/v0.0.1/client/main.js', function (require, module, exports) {

    var List = require("./list");

    function init (config, ready) {
        var self = this;
        self._conf = {
            "ui": {
                "template": {
                    "selector": "",
                    "class": "template"
                },
                "container": ""
            },
            "options": {
                "query": {},
                "options": {}
            },
            "model": "",
            "autoinit": true
        };

        config = $.extend(self._conf, config);
        var instanceSelector = Object.keys(self.view).join(",");
        var $itemTemplate = $(self._conf.ui.template.selector, instanceSelector);
        var list = new List(self);

        self.model = self.model[self._conf.model];
        if (!self.model) {
            throw new Error("Model is not loaded. Please load the model using the composition configuration");
        }

        if (self._conf.autoinit) {
            var req = config.options;
            list.read(req.query, req.options, function () {
                if (err) { return errorHandler(err); }
                ready();
            });
        } else {
            // TODO
        }

        ready();
    }

    module.exports = init;

    return module;
});
