M.wrap('github/IonicaBizau/bind-table-crud/dev/sort.js', function (require, module, exports) {


function init (module, config) {
    var self = module;

    (function (mod) {

        mod.sortCache = { "sort": [] };
        mod.sortCount = 1;
        mod.sortClass = "sort"
        mod.sortSelector = "th span." + mod.sortClass;

        $(mod.dom).on("click", "th", function (e) {

            var $current = $(this);
            $current = $current.find("." + mod.sortClass);
            var $th = $current.parent();

            var $current = $th.find("." + mod.sortClass + ":visible");
            var $next = $current.next();
            if (!$next.length) { $next = $th.find("." + mod.sortClass).first(); }

            var sort = $next.data(mod.sortClass);
            if (!sort) { return; }

            setSort.call(mod, sort, !e.ctrlKey);

            updateUI.call(mod);

            var options = mod.sortCache;
            var infScroll = mod.config.options.infiniteScroll;
            if (infScroll) {
                options.limit = infScroll.skip + infScroll.count;
                options.skip = 0;
                mod.clearList = true;
            }

            // sort, reset, callFind
            mod.emit("setOptions", options, false, true);
        });
    })(self);
}

function setSort (sort, reset) {
    var self = this;

    if (reset) {
        clear.call(this);
        setSort.call(this, sort, false);
    } else {
        if (!sort.length) { return; }

        for (var i = 0; i < self.sortCache.sort.length; ++i) {
            if (sort[0] === self.sortCache.sort[i][0]) {
                self.sortCache.sort.splice(i, 1);
                break;
            }
        }

        if (sort[1] === 0) { return; }

        if (self.sortCache.sort.length >= self.sortCount) {
            self.sortCache.sort.splice(0, 1);
        }

        self.sortCache.sort.push(sort);
    }
}

function clear () {
    var self = this;
    self.sortCache = self.sortCache || {};
    self.sortCache.sort = [];
}

function setSortCount (sortCountToSet) {
    var self = this;
    self.sortCount = sortCountToSet;
}

function updateUI () {
    var self = this;

    // hide all sort spans
    $(self.sortSelector, self.dom).hide();

    // show non-sorted
    $(self.sortSelector + ".sort0", self.dom).show();

    for (var i = 0; i < self.sortCache.sort.length; ++i) {
        var cSort = self.sortCache.sort[i];
        $("[data-key-sort='" + cSort[0] + "']").hide();
        $("[data-key-sort='" + cSort[0] + "']." + self.sortClass + cSort[1]).show();
    }
}

module.exports = {
    init: init,
    clear: clear,
    setSortCount: setSortCount,
    setSort: setSort
};

return module; });
