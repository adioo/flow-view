var Table = require("./table");

module.exports = function (config) {

    config.crud = {
        create: "create",
        read:   "read",
        update: "update",
        // "delete" is considered a keywork by some browsers
        "delete": "remove"
    };

    Table (this, config);
};
