Z.wrap('github/ionicabizau/list/v0.0.1/client/list.js', function (require, module, exports) {

    module.exports = function (self) {
        var config = self._conf;
        this.read = function (query, options, callback) {
            self.model.req({
                m: "find",
                d: {
                    q: query,
                    o: options
                }
            }, callback);
        };
    };

    return module;
});
