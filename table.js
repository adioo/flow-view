var Bind = require("github/jillix/bind");
var Events = require("github/jillix/events");

function Table(module) {

    var self;
    var config;
    var container;
    var template;

    function processConfig(config) {
        config.template.binds = config.template.binds || [];

        config.options = config.options || {};
        config.options.sort = config.options.sort || {};
        config.options.id = config.options.id || "id";

        var optClasses = config.options.classes || {}
        optClasses.item = optClasses.item || "item";
        optClasses.selected = optClasses.selected || "selected";
        config.options.classes = optClasses;

        return config;
    }

    function init(conf) {
        // initialize the globals
        self = this;
        config = processConfig(conf);
        if (config.container) {
            container = $(config.container, module.dom);
        } else {
            container = module.dom;
        }
        template = $(config.template.value, module.dom);

        // **************************************
        // generate general binds from the config
        var binds = [];

        for (var i in config.controls) {
            switch (i) {
                case "add":
                    binds.push({
                        target: config.controls[i],
                        context: ".controls",
                        on: [{
                            name: "click",
                            emit: "requestNewItem",
                            handler: "createItem"
                        }]
                    });
                    break;
                case "delete":
                    binds.push({
                        target: config.controls[i],
                        context: ".controls",
                        on: [{
                            name: "click",
                            handler: "removeSelected"
                        }]
                    });
                    break;
            }
        }

        // run the internal binds
        for (var i in binds) {
            Bind.call(self, binds[i]);
        }

        // run the binds
        for (var i in config.binds) {
            Bind.call(self, config.binds[i]);
        }

        Events.call(self, config);


        if (config.options.autofetch) {
            self.read({}, { sort: config.options.sort });
        }
    }
    
    function render(item) {
        switch (config.template.type) {
            case "selector":
                renderSelector.call(self, item);
            case "html":
                // TODO
            case "url":
                // TODO
        }
    }

    function renderSelector(item) {
        var newItem = $(template).clone();
        newItem
            .removeClass("template")
            .addClass(config.options.classes.item)
            .appendTo(container)
            .show();

        for (var i in config.template.binds) {
            var bindObj = config.template.binds[i];
            bindObj.context = newItem;
            Bind.call(self, bindObj, item);
        }

        newItem.attr('id', item[config.options.id]);
    }

    function clearTable() {
        $("." + config.options.classes.item, container).remove();
    }
    
    // ********************************
    // Public functions ***************
    // ********************************

    var dbData = {
        filter: {},
        options: {}
    };
    
    var oldFilter, newFilter;

    function read(fil, ops) {

        fil = fil || {};
        ops = ops || {};
        
        oldFilter = JSON.stringify(dbData.filter);
        newFilter = JSON.stringify(fil);
        
        var filter = JSON.parse(JSON.stringify(fil));
        var options = JSON.parse(JSON.stringify(ops));
        
        clearTable();

        var data = {};
        data.options = options;

        // add the configured sorting
        if (!data.options.sort) {
            data.options.sort = config.options.sort;
        }

        // merge the configured filters
        if (config.options.filters && typeof config.options.filters === 'object') {
            data.filter = config.options.filters;
        } else {
            data.filter = {};
        }

        for (var i in filter) {
            data.filter[i] = filter[i];
        }

        if (oldFilter !== newFilter) {
            
            dbData.filter = data.filter;
            dbData.options = data.options;
            
            oldFilter = newFilter;

            return;
        }

        self.link(config.crud.read, { data: data }, function(err, data) {

            if (err) { return; }

            if (!data || !data.length) {
                return;
            }

            
            for (var i in data) {
                render.call(self, data[i]);
            }

            var autoselect = config.options.autoselect;
            switch (autoselect) {
                case "first":
                    selectItem(data[0]);
                    break;
                case "last":
                    selectItem(data[data.length - 1]);
                    break;
                default:
                    if (typeof autoselect === "number") {
                        selectItem(data[autoselect]);
                    }
            }
        });
    }

    function createItem(itemData) {
        self.link(config.crud.create, { data: itemData }, function(err, data) {
            if (err) { return; }
            render.call(self, data);    
        });
    }

    function _sendRemove(itemData) {
        var data = {};
        data[config.options.id] = [itemData[config.options.id]];
        self.link(config.crud['delete'], { data: data }, function(err, data) {
            if (err) { return; }
            $("#" + itemData[config.options.id]).remove();
        });
    }

    function removeItem(itemData) {
        if (!config.options.deleteConfirmation) {
            _sendRemove(itemData);
            return;
        }

        self.emit("requestRemoveItem", itemData, function(err, confirmation) {
            if (confirmation) {
                _sendRemove(itemData);
            }
        });
    }

    function removeSelected() {
        var ids = [];
        var selectedClass = config.options.classes.selected;
        $("." + selectedClass, container).each(function() {
            ids.push($(this).attr("id"));
        });

        var filter = {};
        filter.data = {};
        filter.data[config.options.id] = ids; 

        self.link(config.crud['delete'], filter, function(err, data) {
            if (err) { return; }
            $("." + selectedClass, container).remove();
        });
    }

    function deselect() {
        var selectedClass = config.options.classes.selected;
        $("." + selectedClass, container).removeClass(selectedClass);
    }

    function selectItem(dataItem) {

        if (!dataItem) {
            return;
        }

        var selectedClass = config.options.classes.selected;

        switch (config.options.selection) {

            case "single":
                var currentItem = $("#" + dataItem[config.options.id], container);
                if (currentItem.hasClass(selectedClass)) {
                    break;
                }

                $("." + selectedClass, container).removeClass(selectedClass);
                $("#" + dataItem[config.options.id], container).addClass(selectedClass);
                self.emit("selectionChanged", dataItem);
                break;

            case "multiple":
                $("#" + dataItem[config.options.id], module.dom).toggleClass(selectedClass);
                break;

            default: // none
        }
    }

    function show() {
        $(self.dom).parent().show();
    }

    function hide() {
        $(self.dom).parent().hide();
    }

    return {
        init: init,
        read: read,
        createItem: createItem,
        removeItem: removeItem,
        removeSelected: removeSelected,
        deselect: deselect,
        selectItem: selectItem,
        goToNextPage: goToNextPage,
        goToPrevPage: goToPrevPage,
        showPage: showPage,
        emptyPagination: emptyPagination,
        show: show,
        hide: hide
    };
}

module.exports = function (module, config) {

    var table = new Table(module);
    
    for (var i in table) {
        table[i] = module[i] || table[i];
    }
    
    table = Object.extend(table, module);
    table.init(config);

    return table;
}
