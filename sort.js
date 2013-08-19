var self;
module.exports = {
    init: function (module, config) {
        self = module;

        $(self.dom).on("click", "th span.sort", function () {

            var $current = $(this);
            var $th = $current.parent();

            var $current = $th.find(".sort:visible");
            var $next = $current.next();
            if (!$next.length) { $next = $th.find(".sort").first(); }

            $current.hide();
            $next.show();
            var sort = $next[0].sort;
            if (!sort) { return; }

            self.emit("sort", sort);
        });
    }
};
