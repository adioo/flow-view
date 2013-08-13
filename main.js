M.wrap('github/IonicaBizau/bind-table-crud/dev/main.js', function (require, module, exports) {
var List = require("./table");

module.exports = function (config) {

    config.crud = {
        create: "create",
        read:   "read",
        update: "update",
        // "delete" is considered a keywork by some browsers
        "delete": "remove"
    };

    List(this, config);
};

return module; });