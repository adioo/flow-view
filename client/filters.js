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

        };
    };

    return module;
});
