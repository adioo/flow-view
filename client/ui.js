Z.wrap('github/ionicabizau/list/v0.0.1/client/ui.js', function (require, module, exports) {

    module.exports = function (self) {
        var config = self._conf;

        this.render = function (docs) {
            self.view.item.render(docs);
        };
    };

    return module;
});
