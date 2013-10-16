M.wrap('github/IonicaBizau/bind-list-crud/dev/list.js', function (require, module, exports) {
var Bind = require("github/jillix/bind");
var Events = require("github/jillix/events");

function List(module) {

    var self;
    var config;
    var container;
    var template;
    var pagination;
    var paginationNumbers = false;
    var page = 1;

    function processConfig(config) {
        config.template.binds = config.template.binds || [];

        config.options = config.options || {};
        config.options.sort = config.options.sort || {};
        config.options.filter = config.options.filter || {};
        config.options.id = config.options.id || "id";

        config.options.pagination = config.options.pagination || {};

        if (JSON.stringify(config.options.pagination) !== "{}") {
            pagination = config.options.pagination;
        }

        config.options.pagination.numbers = config.options.pagination.numbers || {};

        if (JSON.stringify(config.options.pagination.numbers) !== "{}") {
            paginationNumbers = true;
        }

        config.options.pagination.controls = config.options.pagination.controls || {};
        config.options.pagination.classes = config.options.pagination.classes || {};

        config.options.pagination.numbers.options = config.options.pagination.numbers.options || {}
        config.options.pagination.numbers.classes = config.options.pagination.numbers.classes || {};
        config.options.pagination.numbers.keywords = config.options.pagination.numbers.keywords || {};

        if (pagination) {
            pagination = config.options.pagination;
        }

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
            if (!config.controls.hasOwnProperty(i)) return;

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

        if (pagination) {

            // Build DOM references
            pagination.dom = {};
            pagination.dom.container = $(pagination.container);
            pagination.dom.next = $(pagination.controls.next);
            pagination.dom.previous = $(pagination.controls.previous);
            pagination.dom.pages = [];

            disabledClass = pagination.controls.disable;

            for (var i in pagination.controls) {
                if (!pagination.controls.hasOwnProperty(i)) return;

                switch (i) {

                    case "next":
                        $(pagination.controls[i]).on("click", function () {
                            var clickedElem = $(this);

                            if (clickedElem.hasClass(disabledClass) || clickedElem.prop(disabledClass)) {
                                return false;
                            }

                            goToNextPage();
                            return false;
                        });
                        break;

                    case "previous":
                        $(pagination.controls[i]).on("click", function () {
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
        for (var i in binds) {
            if (!binds.hasOwnProperty(i)) return;
            Bind.call(self, binds[i]);
        }

        // run the binds
        for (var i in config.binds) {
            if (!config.binds.hasOwnProperty(i)) return;
            Bind.call(self, config.binds[i]);
        }

        Events.call(self, config);

        if (config.options.autofetch) {
            self.read({}, { sort: config.options.sort, fields: config.options.fields }, function() {
                self.emit("ready");
            });
        } else {
            self.emit("ready");
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
            .removeClass("hide")
            .addClass(config.options.classes.item)
            .appendTo(container)
            .data("dataItem", item)
            .show();

        for (var i in config.template.binds) {
            if (!config.template.binds.hasOwnProperty(i)) return;
            var bindObj = config.template.binds[i];
            bindObj.context = newItem;
            Bind.call(self, bindObj, item);
        }

        newItem.attr("id", item[config.options.id]);
    }

    function clearList() {
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

        for (var i in pagination.dom.pages) {
            if (!pagination.dom.pages.hasOwnProperty(i)) return;
            $(numbersConfig.classes.before).before(pagination.dom.pages[i]);
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

      /////////////////////
     // LIST FUNCTIONS
    /////////////////////
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

        clearList();

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
            for (var i in config.options.filters) {
                if (!config.options.filters.hasOwnProperty(i)) return;
                data.filter[i] = (config.options.filters || {})[i];
            }
        }

        for (var i in filter) {
            if (!filter.hasOwnProperty(i)) return;
            data.filter[i] = filter[i];
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
            if (!config.options.filter.hasOwnProperty(key)) return;
            crudObj.q[key] = config.options.filter[key];
        }

        self.emit("find", crudObj, function(err, data) {
            renderItems(err, data);
            callback(err, data);
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
    }

    function createItem(itemData) {

        var crudObj = {
            t: config.options.type,
            d: itemData
        };

        self.emit("insert", crudObj, function(err, data) {
            if (err) { return; }
            if (!pagination) {
                render.call(self, data);
            }
            else {
                showPage(page, dbData.filter, dbData.options);
            }
        });
    }

    function _sendRemove(itemData) {
        var query = {};
        query[config.options.id] = [itemData[config.options.id]];

        var crudObj = {
            t: config.options.type,
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
            t: config.options.type,
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

      //////////////////////////////
     // PAGINATION PUBLIC FUNCTIONS
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

    return {
        init: init,
        read: read,
        renderItemsFromResult: renderItemsFromResult,
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

    var list = new List(module);

    for (var i in list) {
        if (!list.hasOwnProperty(i)) return;
        list[i] = module[i] || list[i];
    }

    list = Object.extend(list, module);
    list.init(config);

    return list;
};


return module; });
