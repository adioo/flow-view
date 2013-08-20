M.wrap('github/IonicaBizau/bind-table-crud/dev/sort.js', function (require, module, exports) {
var self;
var sortCache = { "sort": [] };
var sortCount = 1;
var sortClass = "sort"
var sortSelector = "th span." + sortClass;

function init (module, config) {
    self = module;

    $(self.dom).on("click", sortSelector, function () {

        var $current = $(this);
        var $th = $current.parent();

        var $current = $th.find("." + sortClass + ":visible");
        var $next = $current.next();
        if (!$next.length) { $next = $th.find("." + sortClass).first(); }

        var sort = $next.data(sortClass);
        if (!sort) { return; }

        setSort (sort);
        updateUI();

        // sort, reset, callFind
        self.emit("sort", sortCache, false, true);
    });
}

function setSort (sort, reset) {
    if (reset) {
        clear();
        setSort (sort, false);
    } else {
        if (!sort.length) { return; }

        for (var i = 0; i < sortCache.sort.length; ++i) {
            if (sort[0] === sortCache.sort[i][0]) {
                sortCache.sort.splice(i, 1);
                break;
            }
        }

        if (sort[1] === 0) { return; }

        if (sortCache.sort.length >= sortCount) {
            sortCache.sort.splice(0, 1);
        }

        sortCache.sort.push(sort);
    }
}

function clear () {
    sortCache.sort = [];
}

function setSortCount (sortCountToSet) {
    if (sortCount > 2) {
        return console.error("sortCount cannot be greater than 2.");
    }

    sortCount = sortCountToSet;
}

function updateUI () {
    // hide all sort spans
    $(sortSelector, self.dom).hide();

    // show non-sorted
    $(sortSelector + ".sort0", self.dom).show();

    for (var i = 0; i < sortCache.sort.length; ++i) {
        var cSort = sortCache.sort[i];
        $("[data-key-sort='" + cSort[0] + "']").hide();
        $("[data-key-sort='" + cSort[0] + "']." + sortClass + cSort[1]).show();
    }
}

module.exports = {
    init: init,
    clear: clear,
    setSortCount: setSortCount,
    setSort: setSort
};

return module; });
