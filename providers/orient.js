var orient = require("orientdb"),
    Db = orient.Db,
    Server = orient.Server;

var dbConfig = {
    user_name: "admin",
    user_password: "admin"
};

var serverConfig = {
    host: "localhost",
    port: 2424
};
exports.create = function(ds, callback) {
    callback(null, "Not implemented yet for Orient.");
};

exports.read = function(link, ds, callback) {

    var server = new Server(serverConfig);
    var db = new Db(ds.db, server, dbConfig);

    db.open(function(err) {

        if (err) { return console.log(err); }

        // TODO Implement filters
        db.command("SELECT FROM " + ds.collection, function(err, data) {

            if (err) { return callback(err); }

            callback(null, data);
        }); 
    });
};

exports.update = function(ds, callback) {
    callback(null, "Not implemented yet for Orient.");
};

exports.getPages = function(ds, callback) {
    callback(null, "Not implemented yet for Orient.");
};

exports.remove = function(ds, callback) {
    callback(null, "Not implemented yet for Orient.");
};
