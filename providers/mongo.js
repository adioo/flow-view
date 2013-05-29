exports.create = function(link, ds, callback) {

    M.database.open(ds, function(err, db) {
        if (err) { return callback(err); }

        db.collection(ds.collection, function(err, collection) {
            if (err) { callback(err); }

            collection.insert(link, function(err, docs) {
                if (err) { return callback(err); }
                if (!docs[0] || !docs.length) { return callback("No data inserted."); }

                callback(null, docs[0]);
            });
        });
    });
};

exports.read = function(link, ds, callback) {

    var data = link.data || {};
    var filter = data.filter || {};
    var options = data.options || {};

    M.database.open(ds, function(err, db) {
        if (err) { return callback(err); }

        db.collection(ds.collection, function(err, collection) {
            if (err) { return callback(err); }

            collection.find(filter, options).toArray(function(err, docs) {
                if (err) { return callback(err); }

                callback(null, docs || []);
            });
        });
    });
};

exports.update = function(ds, callback) {
    callback(200, { status: "OK" });
};

exports.remove = function(link, ds, callback) {

    M.database.open(ds, function(err, db) {
        if (err) { return callback(err); }

        db.collection(ds.collection, function(err, collection) {
            if (err) { return callback(err); }

            var key = Object.keys(link.data)[0];
            var values = link.data[key] || [];

            // if the special mongo ID is the key, convert it to ObjectID
            if (key === '_id') {
                for (var i in values) {
                    values[i] = M.mongo.ObjectID(values[i]);
                }
            }

            var filter = {};
            filter[key] = { $in: values };

            collection.remove(filter, function(err, docs) {
                if (err) { return callback(err); }

                callback(null);
            });
        });
    });
};

exports.getPages = function(link, ds, callback) {
    
    var pagesNr = 0;
    
    var data = link.data || {};
    var size = data.size;
    
    var filter = data.filter || {};
    var options = data.options || {};
        
    M.database.open(ds, function(err, db) {
        if (err) { return callback(err); }

        db.collection(ds.collection, function(err, collection) {
            if (err) { return callback(err); }

            collection.count(filter, options, function(err, length) {
                if (err) { return callback(err); }
                
                pagesNr = Math.ceil(length / size);

                callback(null, pagesNr);
            });
        });
    });
};

exports.edit = function (link, ds, callback) {

    var data = link.data || {};
    
    M.database.open(ds, function(err, db) {
        if (err) { return callback(err); }

        db.collection(ds.collection, function(err, collection) {
            if (err) { return callback(err); }
            
            // TODO Update document
            callback(); 
           // collection.update(data.dataId,  function(err, length) {
           //     if (err) { return callback(err); }
           //     
           //     callback(null, pagesNr);
           // });
        });
    });
}
