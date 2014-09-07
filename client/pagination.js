Z.wrap('github/ionicabizau/list/v0.0.1/client/pagination.js', function (require, module, exports) {

    module.exports = function (self) {
        var config = self._conf;
        var pagination = this;

        this._cache = {
            skip: 0,
            limit: config.options.limit,
            container: {
                initialHTML: $(self.view.page.dom)[0].outerHTML,
                selector: self.view.page.dom,
                reference: $(self.view.page.dom)
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
                var pagesNumber = Math.ceil(count / config.options.limit);
                var liElms = "";
                for (var i = 0; i < pagesNumber; ++i) {
                    // TODO https://github.com/IonicaBizau/engine-list/issues/3
                    liElms += "<li><a href='#'>" + i + "</a></li>";
                }
                var $container
                $(pagination._cache.container.selector).html(
                    pagination._cache.container.initialHTML.replace(
                        "[pages]",
                        liElms
                    )
                );
            });
        };

        this.select = function (ev, data) {

        };

        this.disableItem = function (ev, data) {

        };
    };

    return module;
});
