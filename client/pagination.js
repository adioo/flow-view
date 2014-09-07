Z.wrap('github/ionicabizau/list/v0.0.1/client/pagination.js', function (require, module, exports) {

    module.exports = function (self) {
        var config = self._conf;
        var pagination = this;

        this._cache = {
            skip: 0,
            limit: config.options.options.limit,
            container: {
                initialHTML: $(self.view.page.dom)[0].outerHTML,
                selector: self.view.page.dom,
                $: $(self.view.page.dom)
            },
            active: 1
        };

        this.update = function (ev, data) {
            self.model.req({
                m: "count",
                q: {},
                o: {
                    fields: {
                        "_foo": 1,
                        "_id": 0
                    }
                }
            }, function (err, count) {
                if (err) { return self._errorHandler(err); }

                // Create data array
                var pagesNumber = Math.ceil(count / pagination._cache.limit);
                var data = [];
                for (var i = 0; i < pagesNumber; ++i) {
                    data.push({
                        pageNr: i + 1
                    });
                }

                // Modify HTML before updating innerHTML
                self.view.page.on.html = function (html) {
                    return pagination._cache.container.initialHTML.replace(
                        "[pages]",
                        html
                    );
                };

                // Render view
                self.view.page.render(data);
            });
        };

        this.select = function (ev, data) {

        };

        this.disableItem = function (ev, data) {

        };
    };

    return module;
});
