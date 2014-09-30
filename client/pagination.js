module.exports = function (self) {
    var config = self._conf;
    var pagination = this;

    pagination._cache = {
        skip: 0,
        limit: config.options.options.limit,
        active: 1,
        itemCount: -1,
        pageCount: -1
    };

    pagination.ui =  {
        initialHTML: $(self.view.page.dom)[0].outerHTML,
        selector: self.view.page.dom,
        $: $(self.view.page.dom),
        classes: config.pagination.classes
    };

    // Handlers
    // TODO Move in ui.js
    pagination.ui.$.on("click", "." + pagination.ui.classes.item, function (ev) {
        pagination.select.call(self, ev, $(this));
        return false;
    });

    pagination.ui.$.on("click", "." + pagination.ui.classes.next, function (ev) {
        pagination.selectNext(self, ev, $(this));
        return false;
    });

    pagination.ui.$.on("click", "." + pagination.ui.classes.prev, function (ev) {
        pagination.selectPrev(self, ev, $(this));
        return false;
    });

    /**
     * update
     * Updates pagination numbers
     *
     * @name update
     * @function
     * @param {Object} ev Event object
     * @param {Object} data Data object
     * @return {undefined}
     */
    pagination.update = function (ev, data) {
        self.model.req({
            m: "count",
            q: self.filters.query
        }, function (err, count) {
            if (err) { return self._errorHandler(err); }

            // Create data array
            var pagesNumber = Math.ceil(count / pagination._cache.limit);
            pagination._cache.itemCount = count;
            pagination._cache.pageCount = pagesNumber;

            var data = [];
            for (var i = 0; i < pagesNumber; ++i) {
                data.push({
                    pageNr: i + 1
                });
            }

            // Modify HTML before updating innerHTML
            self.view.page.on.html = function (html) {
                var $allPages = $(pagination.ui.initialHTML.replace(
                    "[pages]",
                    html
                ));

                var max = config.pagination.numbers.max;
                var active = pagination._cache.active;

                if (max < 3) {
                    switch (max) {
                        // « | »
                        case 0:
                            $allPages = $(pagination.ui.initialHTML.replace(
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
                    var pag = config.pagination;
                    var $liElms = $allPages.find("li:not(." + pag.classes.next + ",." + pag.classes.prev + ")");
                    var $active = $liElms.eq(active + -1 ).addClass(pag.classes.active);
                    var br = null;
                    var i = 0;
                    var $c = null;
                    var $next = $active.next();
                    var $prev = $active.prev();

                    // TODO Clean up code
                    // Go to right
                    while (true) {
                        $c = $next;
                        br = $c.hasClass(pag.classes.next) ||
                             ($c.next().hasClass(pag.classes.next) &&
                             pag.numbers.aLast) ||
                             !$c.length;
                        if (br) { break; }
                        $next = $c.next();
                        if (++i <= pag.numbers.max) { continue; }
                        $c.remove();
                    }

                    // Go to left
                    $c = null;
                    i = 0;

                    while (true) {
                        $c = $prev;
                        br = $c.hasClass(pag.classes.prev) ||
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
                    var $clone = null;
                    if (pag.numbers.aLast) {
                        var lastPageValue1 = parseInt($last.find("a").html());
                        var lastPageValue2 = parseInt($last.prev().find("a").html());
                        if (lastPageValue1 >= lastPageValue2 + 2) {
                            $clone = $last.clone();
                            $clone.addClass(pag.classes.disabled);
                            $clone.find(":contains(" + pagesNumber + ")").text("…");
                            $last.before($clone);
                        }
                    }

                    if (pag.numbers.aFirst) {
                        var firstPageValue1 = parseInt($first.find("a").html());
                        var firstPageValue2 = parseInt($first.next().find("a").html());
                        if (firstPageValue1 <= firstPageValue2 - 2) {
                            $clone = $first.clone();
                            $clone.addClass(pag.classes.disabled);
                            $clone.find(":contains(1)").text("…");
                            $first.after($clone);
                        }
                    }
                }

                $allPages.children().each(function () {
                    var $c = $(this);
                    var nr = parseInt($c.text());
                    if (isNaN(nr)) { return; }
                    $c.attr("data-page", nr);
                });

                $("." + pagination.ui.classes.prev, $allPages)
                    .add($("." + pagination.ui.classes.next, $allPages))
                    .removeClass(pagination.ui.classes.disabled);

                if (active === 1) {
                    $("." + pagination.ui.classes.prev, $allPages).addClass(pagination.ui.classes.disabled);
                }

                if (active === pagination._cache.pageCount) {
                    $("." + pagination.ui.classes.next, $allPages).addClass(pagination.ui.classes.disabled);
                }

                return $allPages[0].outerHTML;
            };

            // Render view
            self.view.page.render(data);


        });
    };

    /**
     * select
     * Selects a page
     *
     * @name select
     * @function
     * @param {Object} ev Event object
     * @param {Object} data Data object
     * @return {undefined}
     */
    pagination.select = function (ev, data) {
        var $page = null;
        var pageNr = -1;
        data = Object(data).page || data;
        if (data instanceof $) {
            $page = data;
            pageNr = parseInt($page.attr("data-page"));
        } else if (typeof (pageNr = parseInt(data)) === "number" && !isNaN(data)) {
            $page = $("[data-page='" + data + "']", pagination.ui.$);
        } else {
            self.emit("notFound");
            return;
        }

        if (isNaN(pageNr) || pageNr < 1 || pageNr > pagination._cache.pageCount + 1) { return; }

        // pagination.ui.$.find("." + pagination.ui.classes.item).removeClass(pagination.ui.classes.active);
        // $page.addClass(pagination.ui.classes.active);

        // TODO Cache somehow to prevent count requests to Mongo
        pagination.update();

        // Update cache and filter options
        pagination._cache.active = pageNr;
        pagination._cache.skip = (pageNr - 1) * config.pagination.size;

        self.emit({
            to: self._conf.filters,
            event: "setFilters"
        }, ev, {
            query: data.q,
            options: { skip: pagination._cache.skip },
            _model: self.model,
            _fetchData: false
        });

        // Emit page changed event
        self.emit("pageChanged", ev, {
            pageNr: pageNr,
            $: $page
        });
    };

    /**
     * selectNext
     * Selects the next page
     *
     * @name selectNext
     * @function
     * @param {Object} ev Event object
     * @param {Object} data Data object
     * @return {undefined}
     */
    pagination.selectNext = function (ev, data) {
        pagination.select(ev, pagination._cache.active + 1);
    };

    /**
     * selectPrev
     * Selects the previous page
     *
     * @name selectPrev
     * @function
     * @param {Object} ev Event object
     * @param {Object} data Data object
     * @return {undefined}
     */
    pagination.selectPrev = function (ev, data) {
        pagination.select(ev, pagination._cache.active - 1);
    };
};
