Z.wrap('github/ionicabizau/list/v0.0.1/client/filters.js', function (require, module, exports) {
    module.exports = function (self) {

        var Filters = this;
        var config = self._conf;

        // Query and options
        Filters._query = {};
        Filters._options = {};

        function resetObj(obj) {
            for (var k in obj) {
                delete obj[k];
            }
        }

        Filters.set = function (ev, data) {
            var what = null;
            var fields = ["query", "options"];

            // Reset data
            if (data._qReset) { resetObj(Filters._query); }
            if (data._oReset) { resetObj(Filters._options); }

            // Merge data
            $.each(fields, function () {
                var c = this;
                if (!(what = data[c])) { return; }
                var ref = Filters["_" + c];
                for (var f in config.options[c]) {
                    ref[f] = config.options[c][f];
                }
                for (var f in what) {
                    ref[f] = what[f];
                }
            });
        };
    };

    return module;
});
