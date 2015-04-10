var Bind = require("github/jillix/bind");
var Events = require("github/jillix/events");
var Waiter = require("./waiter");

function Table(module) {

    var self;
    var config;
    var container;
    var template;

    // pagination variables
    var pagination;
    var paginationNumbers = false;
    var page = 1;

    function processConfig(config) {
        config.template.binds = config.template.binds || [];

        config.options = config.options || {};
        config.options.sort = config.options.sort || {};
        config.options.filter = config.options.filter || {};
        config.options.id = config.options.id || "id";

        var optClasses = config.options.classes || {}
        optClasses.item = optClasses.item || "item";
        optClasses.selected = optClasses.selected || "selected";
        config.options.classes = optClasses;
       
        // pagination config
        config.options.pagination = config.options.pagination || {};

        if (JSON.stringify(config.options.pagination) !== "{}") { pagination = config.options.pagination; }

        config.options.pagination.numbers = config.options.pagination.numbers || {};
<<<<<<< HEAD:list.js

        if (JSON.stringify(config.options.pagination.numbers) !== "{}") {
            paginationNumbers = true;
        }

=======
        
        if (JSON.stringify(config.options.pagination.numbers) !== "{}") { paginationNumbers = true; }
        
>>>>>>> 66462caef7672f021a68e3953d8e91f79c3f2d99:table.js
        config.options.pagination.controls = config.options.pagination.controls || {};
        config.options.pagination.classes = config.options.pagination.classes || {};

        config.options.pagination.numbers.options = config.options.pagination.numbers.options || {}
        config.options.pagination.numbers.classes = config.options.pagination.numbers.classes || {};
        config.options.pagination.numbers.keywords = config.options.pagination.numbers.keywords || {};
<<<<<<< HEAD:list.js

        if (pagination) {
            pagination = config.options.pagination;
        }

        var optClasses = config.options.classes || {}
        optClasses.item = optClasses.item || "item";
        optClasses.selected = optClasses.selected || "selected";
        config.options.classes = optClasses;
=======
        
        if (pagination) { pagination = config.options.pagination; }

        // editable
        config.editable          = config.editable       || {};
        config.editable.type     = config.editable.type  || "text";
        config.editable.pk       = config.editable.pk    || 1;
        config.editable.title    = config.editable.title || "Edit:";
        // If no selector provided, then there will be no editable elements on the page
        config.editable.selector = config.editable.selector || ""; 
>>>>>>> 66462caef7672f021a68e3953d8e91f79c3f2d99:table.js

        if (config.waiter) {
            Waiter.init(self, config.waiter);
        }

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

        for (var key in config.controls) {
            if (!config.controls.hasOwnProperty(key)) continue;

            switch (key) {
                case "add":
                    binds.push({
                        target: config.controls[key],
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
                        target: config.controls[key],
                        context: ".controls",
                        on: [{
                            name: "click",
                            handler: "removeSelected"
                        }]
                    });
                    break;
            }
        }

        if (pagination) {

            // Build DOM references
            pagination.dom = {};
            pagination.dom.container = $(pagination.container);
            pagination.dom.next = $(pagination.controls.next);
            pagination.dom.previous = $(pagination.controls.previous);
            pagination.dom.pages = [];

            disabledClass = pagination.controls.disable;

            for (var key in pagination.controls) {
                if (!pagination.controls.hasOwnProperty(key)) continue;

                switch (key) {

                    case "next":
                        $(pagination.controls[key]).on("click", function () {
                            var clickedElem = $(this);

                            if (clickedElem.hasClass(disabledClass) || clickedElem.prop(disabledClass)) {
                                return false;
                            }

                            goToNextPage();
                            return false;
                        });
                        break;

                    case "previous":
                        $(pagination.controls[key]).on("click", function () {
                            var clickedElem = $(this);

                            if (clickedElem.hasClass(disabledClass) || clickedElem.prop(disabledClass)) {
                                return false;
                            }

                            goToPrevPage();
                            return false;
                        });
                        break;
                }
            }

            if (paginationNumbers) {

                $(self.dom).on("click", "." + pagination.numbers.classes.item, function() {

                    if ($(this).hasClass("active")) {
                        return false;
                    }

                    var pageNumber = parseInt($(this).attr("data-page"));

                    if (!pageNumber) {
                        return;
                    }

                    page = pageNumber;

                    showPage(pageNumber, dbData.filter, dbData.options);

                    if (!pagination.hash) {
                        return false;
                    }
                });
            }
        }

        // run the internal binds
        for (var i = 0; i < binds.length; ++i) {
            Bind.call(self, binds[i]);
        }

        // run the binds
        if (config.binds) {
            for (var i = 0; i < config.binds.length; ++i) {
                Bind.call(self, config.binds[i]);
            }
	    }

        Events.call(self, config);

        if (config.options.autofetch) {
            self.read(config.options.filters || {}, { sort: config.options.sort });
        }
    }

    function getDataItem (jQueryObject) {
        return jQueryObject.data("dataItem");
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

        if (!item) { return; }
        if (item instanceof Array) {
            for (var i = 0; i < item.length; ++i) {
                renderSelector(item[i]);
            }
            return;
        }

        var newItem = $(template).clone();
        newItem
            .removeClass("template")
            .removeClass("hide")
            .addClass(config.options.classes.item)
            .appendTo(container)
            .data("dataItem", item)
            .show();

        if (config.template.binds) {
            for (var i = 0; i < config.template.binds.length; ++i) {
                var bindObj = config.template.binds[i];
                bindObj.context = newItem;
                Bind.call(self, bindObj, item);
            }
        }

        newItem.attr("id", item[config.options.id]);
    }

    function clearTable() {
        $("." + config.options.classes.item, container).remove();
    }
    
    // ********************************
    // Pagination functions ***********
    // ********************************
    var disabledClass;

    function setDisabled(filter, options) {

        var data = {
            "filter": filter,
            "options": options,
            "size": pagination.size
        };

        getPages(data, function(err, pagesNr) {
            if (err) { return; }

            // the the pagination only when at least 2 pages
            if (pagesNr > 1) {
                pagination.dom.container.show();
            } else {
                pagination.dom.container.hide();
            }

            if (paginationNumbers) {
                buildPaginationNumbers(pagesNr);
            }

            var controls = pagination.controls;
            var disableClass = pagination.classes.disable;
            var disableAttr = pagination.controls.disable;

            if (page <= 1) {
                $(controls.previous).attr(disableAttr, "");
                $(controls.previous).addClass(disableClass);
            }
            else {
                $(controls.previous).removeAttr(disableAttr);
                $(controls.previous).removeClass(disableClass);
            }

            if (page >= pagesNr) {
                $(controls.next).attr(disableAttr, "");
                $(controls.next).addClass(disabledClass, "");
            }
            else {
                $(controls.next).removeAttr(disableAttr);
                $(controls.next).removeClass(disableClass);
            }
        });
    }

    function buildPaginationNumbers(numbers) {

        numbers = parseInt(numbers) || 0;

        emptyPagination();

        var numbersConfig = pagination.numbers;
        var template = numbersConfig.template;

        for (var i = 1; i <= numbers; i++) {
            var item = $(template).clone().removeClass(template.substring(1)).addClass(numbersConfig.classes.item);

            var html = item[0].outerHTML;
            html = html.replace(new RegExp(numbersConfig.keywords.pageNumber, "g"), i);

            // if current page add the active class name
            html = html.replace(new RegExp(numbersConfig.keywords.active, "g"), (page !== i ? "" : numbersConfig.classes.active));

            item = $(html);

            var appendItem = true;

            // if we have options for showing the pages numbers
            if (!$.isEmptyObject(numbersConfig.options)) {
                appendItem = false;

                var options = numbersConfig.options;

                // If max is 0, then only Next and Prev buttons are shown.
                if (options.max) {

                    // Show only the current page
                    if (options.max === 1 && i === page) {
                        pagination.dom.pages.push(item);
                    }

                    // First page ... current
                    if (options.max === 2) {
                        if (i === 1) {
                            pagination.dom.pages.push(item);
                        }

                        // If is current page
                        if (i === page) {
                            // To prevent "« 1 ... 2"
                            if (i > 2) {
                                appendDots();
                            }

                            pagination.dom.pages.push(item);
                        }
                    }


                    /*
                        If max is 3:
                            « 1 ... current ... last »
                        If max is greather than 3
                            « 1 ... current - delta --> current --> current + delta ... last »
                    */
                    if (options.max >= 3) {

                        // TODO Maybe a more inspired variable name?
                        var delta = options.max - 3;

                        if (i === 1) {
                            pagination.dom.pages.push(item);

                            if (page - delta > 2) {
                                appendDots();
                            }
                        }

                        if (i === numbers) {
                            if (page < numbers - 2 && numbers > delta) {
                                appendDots();
                            }

                            pagination.dom.pages.push(item);
                        }

                        if (i >= page - delta && i <= page + delta) {
                            pagination.dom.pages.push(item);
                        }
                    }
                }
            }
            else {
                pagination.dom.pages.push(item);
            }
        }

        for (var key in pagination.dom.pages) {
            if (!pagination.dom.pages.hasOwnProperty(key)) continue;
            $(numbersConfig.classes.before).before(pagination.dom.pages[key]);
        }
    }

    function appendDots() {

        var li = $("<li>");
        li.addClass(pagination.numbers.classes.item);

        var span = $("<span>");
        span.text("…");

        li.append(span);

        pagination.dom.pages.push(li);
    }

    function getPages(data, callback) {

        var query = data.filter || {};
        var options = data.options || {};

        delete options.limit;
        delete options.skip;

        var crudObj = {
            t: config.options.template,
            q: query,
            o: options,
            f: {
                // this will make sure we receive only empty objects (if the dummy property does not exist)
                "_dummy_property": 1,
                "_id": 0
            }
        }

        self.emit("find", crudObj, function(err, docs) {
            if (err) {
                callback(err);
                return;
            }

            var pagesNr = Math.ceil(docs.length / pagination.size);
            callback(null, pagesNr);
        });
    }

    // ********************************
    // Public functions ***************
    // ********************************

    var dbData = {
        filter: {},
        options: {}
    };

    var oldFilter, newFilter;

    function read(fil, ops, callback) {

        fil = fil || {};
        ops = ops || {};

        oldFilter = JSON.stringify(dbData.filter);
        newFilter = JSON.stringify(fil);

        var filter = JSON.parse(JSON.stringify(fil));
        var options = JSON.parse(JSON.stringify(ops));
<<<<<<< HEAD:list.js

        clearList();

=======
        
        clearTable();
        
>>>>>>> 66462caef7672f021a68e3953d8e91f79c3f2d99:table.js
        if (pagination) {
            var size = pagination.size;
            var skip = (page - 1) * size;

            options.limit = options.size || size;
            options.skip = options.skip || skip;

            setDisabled(filter, options);
        }

        var data = {};
        data.options = options;

        // add the configured sorting
        if (!data.options.sort) {
            data.options.sort = config.options.sort;
        }

        data.filter = {};
        // merge the configured filters
        if (config.options.filters && typeof config.options.filters === "object") {
            for (var key in config.options.filters) {
                if (!config.options.filters.hasOwnProperty(key)) continue;
                data.filter[key] = (config.options.filters || {})[key];
            }
        }

        for (var key in filter) {
            if (!filter.hasOwnProperty(key)) continue;
            data.filter[key] = filter[key];
        }
        
        if (oldFilter !== newFilter && pagination) {

            dbData.filter = data.filter;
            dbData.options = data.options;

            page = 1;

            oldFilter = newFilter;

            showPage(page, dbData.filter, dbData.options);
            return;
        }

        var query = data.filter || {};
        var options = data.options || {};

        var crudObj = {
            t: config.options.template,
            q: query,
            o: options,
            f: config.options.fields
        };

        for (var key in config.options.filter) {
            if (!config.options.filter.hasOwnProperty(key)) continue;
            crudObj.q[key] = config.options.filter[key];
        }

<<<<<<< HEAD:list.js
        self.emit("find", crudObj, function(err, data) {
            renderItems(err, data);
            callback(err, data);
=======
            var autoselect = config.options.autoselect;
            setEditable();

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
>>>>>>> 66462caef7672f021a68e3953d8e91f79c3f2d99:table.js
        });
    }

    function renderItemsFromResult (err, data) {

        if (err) { return; }

        clearList();

        if (pagination) {
            // TODO
            alert("Pagination not yet implemented using bind-filter... :-(");
        }

        renderItems(err, data);
    }

    function renderItems (err, data) {

        if (err) { return; }

        if (!data) {
            return;
        }

        for (var i = 0, l = data.length; i < l; ++i) {
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

        self.emit("itemsRendered", data);
    }

    function createItem(itemData, callback) {

        var crudObj = {
            t: config.options.template,
            d: itemData
        };

        self.emit("insert", crudObj, function(err, data) {
            if (callback) {
                return callback(err, data);
            }
            if (err) { return; }
            if (!pagination) {
                render.call(self, data);
            }
            else {
                showPage(page, dbData.filter, dbData.options);
            }
        });
    }

    /*
     *  This functions updates an item in the database via CRUD
     *
     * */
    function updateItem(query, updateObj, callback) {

        // create the crud object
        var crudObj = {
            t: config.options.template,
            q: query || {},
            d: updateObj
        };
        callback = callback || function () {};

        // Normalize the query if id is provided
        if (query[config.options.id]) {
            crudObj.q = {};
            crudObj.q[config.options.id] = query[config.options.id]
        }


        // send the crud object to crud
        self.emit("update", crudObj, function (err) {
            if (err) { return callback(err); }
            delete crudObj.d;
            var args = arguments;
            self.emit("find", crudObj, function(err, data) {
                if (err) { return callback(err); }
                for (var i = 0; i < data.length; ++i) {
                    var cData = $("#" + data[i]._id).data("dataItem");
                    for (var k in cData) {
                        delete cData[k];
                        cData[k] = data[i][k];
                    }
                }
                callback.apply(self, args);
            });
        });
    }

    function _sendRemove(itemData) {
        var query = {};
        query[config.options.id] = {
            "$in": [itemData[config.options.id]]
        };

        var crudObj = {
            t: config.options.template,
            q: query
        };

        self.emit("remove", crudObj, function(err, data) {
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

        var crudObj = {
            t: config.options.template,
            q: filter
        };

        self.emit("remove", crudObj, function(err, data) {
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

        if (dataItem instanceof jQuery) {
            dataItem = getDataItem(dataItem);
            selectItem(dataItem);
            return;
        }

        var selectedClass = config.options.classes.selected;

        switch (config.options.selection) {

            case "single":
                var currentItem = $("#" + dataItem[config.options.id], container);

                if (!currentItem.length) {

                    var crudObj = {
                        t: config.options.template,
                        q: query,
                        o: options
                    }

                    return self.emit("find", crudObj, function(err, doc) {
                        if (err) { return console.error (err); }
                        if (!doc || !doc.length) {
                            return console.error ("No document found");
                        }
                        doc = doc[0];
                        selectItem (doc);
                    });
                }

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

<<<<<<< HEAD:list.js
    function getSelected (data) {

        var $selected = $("." + config.options.classes.item + "." + config.options.classes.selected, self.dom);

        if (!data) {
            return $selected;
        }

        var selectedData = [];
        $selected.each(function () {
            selectedData.push($(this).data("dataItem"));
        });

        return selectedData;
    }

      //////////////////////////////
     // PAGINATION PUBLIC FUNCTIONS
=======
    //////////////////////////////
    // PAGINATION PUBLIC FUNCTIONS
>>>>>>> 66462caef7672f021a68e3953d8e91f79c3f2d99:table.js
    //////////////////////////////
    function goToNextPage() {
        showPage(++page, dbData.filter, dbData.options);
    }

    function goToPrevPage() {
        showPage(--page, dbData.filter, dbData.options);
    }

    function showPage(number, filter, options) {

        var size = pagination.size;
        var skip = (number - 1) * size;

        var fil = JSON.parse(JSON.stringify(filter));
        var ops = JSON.parse(JSON.stringify(options));

        ops.skip = skip;
        ops.limit = size;

        read(fil, ops);
    }

    function emptyPagination() {
        $("." + pagination.numbers.classes.item).remove();
        pagination.dom.pages = [];
    }

<<<<<<< HEAD:list.js
    function setTemplate (template) {
        config.options.template = template.toString();
    }

    var moduleMethods = {
=======
    // editable elements
    function setEditable () {
        $(config.editable.selector, self.dom).editable({
            type:  config.editable.type,
            pk:    config.editable.pk,
            url:   config.editable.url,
            title: config.editable.title,
            params: function(params) {
                var data = params;
                data.dataId = $(this).parent().attr("id");
                return data;
            }
        });
    }

    return {
>>>>>>> 66462caef7672f021a68e3953d8e91f79c3f2d99:table.js
        init: init,
        read: read,

        renderItemsFromResult: renderItemsFromResult,

        createItem: createItem,
        updateItem: updateItem,
        removeItem: removeItem,

        removeSelected: removeSelected,

        deselect: deselect,
        selectItem: selectItem,
        getSelected: getSelected,

        goToNextPage: goToNextPage,
        goToPrevPage: goToPrevPage,
        showPage: showPage,
        emptyPagination: emptyPagination,

        setTemplate: setTemplate,

        show: show,
        hide: hide
    };

    // create listen interface and attach functions to self
    for (var meth in moduleMethods) {
        if (!moduleMethods.hasOwnProperty(meth)) continue;
        (function (method) {
            module[method] = moduleMethods[method];
            module.on(method, function () {

                var args = Array.prototype.slice.call(arguments, 0);
                var callback = args[args.length - 1];

                var argsWithoutCallback = [];
                for (var i = 0; i < args.length; ++i) {
                    if (typeof args[i] === "function") continue;
                    argsWithoutCallback.push(args[i]);
                }

                var result = moduleMethods[method].apply(this, argsWithoutCallback);

                if (typeof callback === "function") {
                    callback(result);
                }
            });
        })(meth);
    }

    return moduleMethods;
}

module.exports = function (module, config) {

<<<<<<< HEAD:list.js
    var list = new List(module);

    for (var key in list) {
        if (!list.hasOwnProperty(key)) continue;
        list[key] = module[key] || list[key];
    }

    list = Object.extend(list, module);
    list.init(config);

    return list;
};
=======
    var table = new Table(module);
    
    for (var i in table) {
        table[i] = module[i] || table[i];
    }
    
    table = Object.extend(table, module);
    table.init(config);

    return table;
}
>>>>>>> 66462caef7672f021a68e3953d8e91f79c3f2d99:table.js
