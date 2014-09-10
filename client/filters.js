Z.wrap('github/ionicabizau/list/v0.0.1/client/filters.js', function (require, module, exports) {
    module.exports = function (self) {
        var Filters = this;
        var config = self._conf;
        Filters._get = {};
        Filters.set = function (ev, data) {
            var filters = data.filters || data;
            if (data.reset) {
                for (var k in Filters._get) {
                    delete Filters._get[k];
                }
            }
            for (var f in config.options.query) {
                Filters._get[f] = config.options.query[f];
            }
            for (var f in filters) {
                Filters._get[f] = filters[f];
            }
        };
    };

    return module;
});
