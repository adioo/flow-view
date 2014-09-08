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
            active: 9
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
                    var $allPages = $(pagination._cache.container.initialHTML.replace(
                        "[pages]",
                        html
                    ));

                    var max = config.pagination.numbers.max;
                    if (max < 3) {
                        switch (max) {
                            // « | »
                            case 0:
                                $allPages = $(pagination._cache.container.initialHTML.replace(
                                    "[pages]",
                                    ""
                                ));
                                break;
                            // « | <pgNr> | »
                            case 1:
                                // TODO
                                break;
                            case 2:
                                // TODO
                                break;
                        }
                    } else {
                        var active = pagination._cache.active;
                        var pag = config.pagination;
                        var $liElms = $allPages.find("li:not(." + pag.classes.next + ",." + pag.classes.prev + ")");
                        var $active = $liElms.eq(active + -1 ).addClass(pag.classes.active);

                        // TODO Clean up code
                        // Go to right
                        var $c = null;
                        var $next = $active.next();
                        var i = 0;
                        while (true) {
                            $c = $next;
                            var br = $c.hasClass(pag.classes.next) ||
                                     ($c.next().hasClass(pag.classes.next) &&
                                     pag.numbers.aLast) ||
                                     !$c.length;
                            if (br) { break; }
                            $next = $c.next();
                            if (++i <= pag.numbers.max) { continue; }
                            $c.remove();
                        }

                        // Go to left
                        var $c = null;
                        var $prev = $active.prev();
                        var i = 0;
                        while (true) {
                            $c = $prev;
                            var br = $c.hasClass(pag.classes.prev) ||
                                     ($c.prev().hasClass(pag.classes.prev) &&
                                     pag.numbers.aLast) ||
                                     !$c.length;
                            if (br) { break; }
                            $prev = $c.prev();
                            if (++i <= pag.numbers.max) { continue; }
                            $c.remove();
                        }

                        // Append dots
                        var $last = $liElms.last();
                        var $first = $liElms.first();
                        if (pag.numbers.aLast) {
                            var lastPageValue1 = parseInt($last.find("a").html())
                            var lastPageValue2 = parseInt($last.prev().find("a").html())
                            if (lastPageValue1 >= lastPageValue2 + 2) {
                                var $clone = $last.clone();
                                $clone.addClass(pag.classes.disabled);
                                $clone.find(":contains(" + pagesNumber + ")").text("…");
                                $last.before($clone);
                            }
                        }

                        if (pag.numbers.aFirst) {
                            var firstPageValue1 = parseInt($first.find("a").html())
                            var firstPageValue2 = parseInt($first.next().find("a").html())
                            if (firstPageValue1 <= firstPageValue2 - 2) {
                                var $clone = $first.clone();
                                $clone.addClass(pag.classes.disabled);
                                $clone.find(":contains(1)").text("…");
                                $first.after($clone);
                            }
                        }
                    }

                    return $allPages[0].outerHTML;
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
