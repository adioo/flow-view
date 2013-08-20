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

        // TODO Don't reset sort
        set(sort, true);
        updateUI();

        // sort, reset, callFind
        self.emit("sort", sortCache, false, true);
    });
}

function set (sort, reset) {
    if (reset) {
        clear();
        set (sort, false);
    } else {
        // TODO Remove duplicate keys
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
    $(sortSelector + ".non-sorted", self.dom).show();

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
    set: set
};

return module; });
