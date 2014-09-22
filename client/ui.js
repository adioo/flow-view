Z.wrap('github/ionicabizau/list/v0.0.1/client/ui.js', function (require, module, exports) {

    module.exports = function (self) {
        var config = self._conf;

        /**
         * render
         * Render data
         *
         * @name render
         * @function
         * @param {Array} docs Documents to render
         * @return {undefined}
         */
        this.render = function (docs) {
            self.view.item.render(docs);
        };
    };

    return module;
});
