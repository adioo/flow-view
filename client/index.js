var $ = require("/libs/jquery");
var Mustache = require("./mustache").bind(exports);

exports.init = function () {
    var conf = this._config;
    var $template = $(conf.template);
    this.ui = {
        container: $(conf.container),
        template: $template.clone().removeClass("template").get(0).innerHTML
    };
    $template.remove();
};

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

exports.renderOne = function (ev, data, doNotAppend) {
    var self = this;
    var rendered = Mustache(self.ui.template, data);
    if (!doNotAppend) {
        self.ui.container.append(rendered);
        self.emit("renderOneDone", ev, data);
    }
    return rendered;
};

exports.empty = function (ev, data) {
    self.ui.container.empty();
};
