var providers = {
    mongo: require("./providers/mongo"),
    orient: require("./providers/orient")
};

var sampleItems = [];
var sampleIndex = 0;

function executeProviderOperation(link, ds, name) {

    var provider = providers[ds.type] || {};
    if (typeof provider[name] !== "function") {
        link.send(400, { status: "No such function '" + name + "' in provider '" + ds.type + "'" });
        return;
    }

    provider[name](link, ds, function(err, data) {
        if (err) { return link.send(400, err); }

        link.send(200, data);
    });
}

exports.create = function(link) {

    if (!link.data) { return link.send(400, { status: "Missing data" }); }

    // if this is a sample table
    if (link.params && link.params.ds === "testDS") {
        var itemData = createSampleItem(link.data);
        link.send(200, itemData);
        return;
    }

    M.datasource.resolve(link.params.ds, function(err, ds) {
        if (err) { return link.send(400, err); }

        executeProviderOperation(link, ds, 'create');
    });
};

exports.read = function(link) {

    if (link.params && link.params.ds === "testDS") {
        
        var itemsToSend = sampleItems;
        
        var data = link.data || {};
        var filter = data.filter || {};
        var options = data.options || {};

        if (options.skip >= 0 && options.limit >= 0) {

            var begin = options.skip;
            var end = begin + options.limit;
            
            if (end > itemsToSend.length) {
                end = itemsToSend.length;
            }
            
            itemsToSend = itemsToSend.slice(begin, end);
        }
        
        link.send(200, itemsToSend);
        return;
    }

    M.datasource.resolve(link.params.ds, function(err, ds) {
        if (err) { return link.send(400, err); }

        executeProviderOperation(link, ds, 'read');
    });
};

exports.update = function(link) {

    M.datasource.resolve(link.params.ds, function(err, ds) {

        if (err) {
            link.send(400, err);
            return;
        }
        
        executeProviderOperation(link, ds, 'update');
    });
};

exports.remove = function(link) {

    if (!link.data) {
        link.send(400, { status: "Missing data" });
    }

    // test data
    if (link.params && link.params.ds === "testDS") {
        removeSampleItems(link.data);
        link.send(200, { status: "OK" });
        return;
    }

    M.datasource.resolve(link.params.ds, function(err, ds) {

        if (err) {
            link.send(400, err);
            return;
        }

        executeProviderOperation(link, ds, 'remove');
    });
};

exports.getPages = function(link) {
    
    if (link.params && link.params.ds === "testDS") {

        var data = link.data || {};
        var size = data.size;

        pagesNr = Math.ceil(sampleItems.length / size);
        
        link.send(200, "" + (pagesNr || 0));
        return;
    }

    M.datasource.resolve(link.params.ds, function(err, ds) {

        if (err) {
            link.send(400, err);
            return;
        }

        executeProviderOperation(link, ds, 'getPages');
    });
};

function createSampleItem(data) {

    if (sampleItems.length >= 20) {
        initSampleItems();
    }

    var itemData = data;
    itemData.id = ++sampleIndex;
    itemData.text = "Dynamic item " + itemData.id;
    sampleItems.push(itemData);

    return itemData;
}

function removeSampleItems(data) { 

    var keys = Object.keys(data);
    var key = keys[0];
    var ids = data[key] || [];

    for (var j in ids) {
        for (var i in sampleItems) {
            if (sampleItems[i] && (sampleItems[i].id + "") == (ids[j] + "")) {
                sampleItems.splice(i, 1);
                break;
            }
        }
    }

    if (sampleItems.length == 0) {
        initSampleItems();
    }
}

function initSampleItems() {
    sampleItems = [];
    for (var i = 0; i < 10; i++) {
        sampleItems.push({
            id: ++sampleIndex,
            text: "Static item " + (i + 1)
        });
    }
}

initSampleItems();

