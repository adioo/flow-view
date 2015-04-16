// Dependencies
var $ = require("/libs/jquery");
var Mustache = require("./mustache/index").bind(exports);

exports.init = function () {
    var conf = this._config;
    var $template = $(conf.template);
    this.ui = {
        container: $(conf.container),
        template: $template.clone().removeClass("template").get(0).innerHTML
    };
    $template.remove();
};

/**
 * render
 * Renders provided documents.
 *
 * @name render
 * @function
 * @param {Event} ev The event object.
 * @param {Object} data An object containing:
 *
 *  - `docs` (Array): An array of objects to list.
 *
 * @return {undefined}
 */
exports.render = function (ev, data) {

    if (!Array.isArray(data.docs)) {
        console.error(new Error("Missing documents."));
    }

    var self = this;
    var str = "";
    data.docs.forEach(function (c) {
        str += self.renderOne(null, c, true);
    });
    self.ui.container.append(str);
    self.emit("renderDone", ev, data);
};

/**
 * renderOne
 * Renders a document.
 *
 * @name renderOne
 * @function
 * @param {Event} ev The event object.
 * @param {Object} data The data object to be added.
 * @param {Boolean} doNotAppend If true, the item will not be added into HTML its value being returned.
 * @return {String} The rendered document HTML.
 */
exports.renderOne = function (ev, data, doNotAppend) {
    var self = this;
    var rendered = Mustache(self.ui.template, data);
    if (!doNotAppend) {
        self.ui.container.append(rendered);
        self.emit("renderOneDone", ev, data);
    }
    return rendered;
};

/**
 * empty
 * Empties the container.
 *
 * @name empty
 * @function
 * @return {undefined}
 */
exports.empty = function (ev, data) {
    this.ui.container.empty();
};
