var List = require("./list");

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

