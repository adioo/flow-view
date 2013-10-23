
function init (module, config) {
    var self = module;

    (function (mod) {

        mod.sortCache = { "sort": [] };
        mod.sortCount = 1;
        mod.sortClass = "sort"
        mod.sortSelector = "th span." + mod.sortClass;

        $(mod.dom).on("click", "th", function (e) {

            if ($(this).attr('data-nosort')) { return; }

            var $current = $(this);
            $current = $current.find("." + mod.sortClass);
            var $th = $current.parent();

            var $current = $th.find("." + mod.sortClass + ":visible");
            var $next = $current.next();
            if (!$next.length) { $next = $th.find("." + mod.sortClass).first(); }

            var sort = $next.data(mod.sortClass);
            if (!sort) { return; }


            var options = mod.sortCache;
            var infScroll = mod.config.options.infiniteScroll;
            if (infScroll) {
                options.limit = infScroll.skip + infScroll.count;
                options.skip = 0;
                mod.clearList = true;
            }

            setSort.call(mod, sort, !e.ctrlKey, true);
            updateUI.call(mod);
        });
    })(self);
}

/*
 * Sets the sort and emits "setOptions" sending the sortCache
 * */

function setSort (sort, reset, callFind) {

    // get self
    var self = this;

    // if reset
    if (reset) {

        // clear sort
        clear.call(this);

        // and call again this function with reset false
        setSort.call(this, sort, false, callFind);

    } else {

        // return if no sort
        if (!sort.length) { return; }

        // remove existing sorts
        for (var i = 0; i < self.sortCache.sort.length; ++i) {
            if (sort[0] === self.sortCache.sort[i][0]) {
                self.sortCache.sort.splice(i, 1);
                break;
            }
        }

        // pushSort is set to false when there is no sort
        var pushSort = true;

        // no sort
        if (sort[1] === 0) {
            // so, pushSort must be false
            pushSort = false;
        }

        // remove first sort when sort length is higher than sortCount
        if (self.sortCache.sort.length >= self.sortCount) {
            self.sortCache.sort.splice(0, 1);
        }

        // push the new sort array in the sortCache.sort array
        if (pushSort) {
            // only if pushSort is true
            self.sortCache.sort.push(sort);
        }

        // and emit setOptions:
        // sort, reset: false, callFind: true/false
        self.emit("setOptions", self.sortCache, false, callFind);
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

