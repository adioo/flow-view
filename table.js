var Bind = require("github/jillix/bind");
var Events = require("github/jillix/events");

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
        config.options.id = config.options.id || "id";

        var optClasses = config.options.classes || {}
        optClasses.item = optClasses.item || "item";
        optClasses.selected = optClasses.selected || "selected";
        config.options.classes = optClasses;
       
        // pagination config
        config.options.pagination = config.options.pagination || {};

        if (JSON.stringify(config.options.pagination) !== "{}") { pagination = config.options.pagination; }

        config.options.pagination.numbers = config.options.pagination.numbers || {};
        
        if (JSON.stringify(config.options.pagination.numbers) !== "{}") { paginationNumbers = true; }
        
        config.options.pagination.controls = config.options.pagination.controls || {};
        config.options.pagination.classes = config.options.pagination.classes || {};

        config.options.pagination.numbers.options = config.options.pagination.numbers.options || {}
        config.options.pagination.numbers.classes = config.options.pagination.numbers.classes || {};
        config.options.pagination.numbers.keywords = config.options.pagination.numbers.keywords || {};
        
        if (pagination) { pagination = config.options.pagination; }

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

        if (pagination) {

            // Build DOM references
            pagination.dom = {};
            pagination.dom.container = $(pagination.container);
            pagination.dom.next = $(pagination.controls.next);
            pagination.dom.previous = $(pagination.controls.previous);
            pagination.dom.pages = [];

            disabledClass = pagination.controls.disable
            
            for (var i in pagination.controls) {
                switch (i) {
                    case "next":
                        binds.push({
                            target: pagination.controls.next,
                            // TODO Don't click on disabled class!
                            on: [{
                                name: "click",
                                handler: "goToNextPage"
                            }]
                        });
                        break;
                    
                    case "previous":
                        binds.push({
                            target: pagination.controls.previous,
                            on: [{
                                name: "click",
                                handler: "goToPrevPage"
                            }]
                        });
                        break;
                }
            }

            if (paginationNumbers) {
                
                $(self.dom).on("click", "." + pagination.numbers.classes.item + ":not(.active)", function() {
                    var pageNumber = parseInt($(this).attr("data-page"));

                    if (!pageNumber) {
                        return;
                    }

                    page = pageNumber;
                    
                    showPage(pageNumber, dbData.filter, dbData.options);
                });
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

            // hide next button if on the last page
            if (page === i) $(pagination.controls.next, self.dom).hide();
            else $(pagination.controls.next, self.dom).show();

            // hide previous button if on the first page
            if (page === 1) $(pagination.controls.previous, self.dom).hide();
            else $(pagination.controls.previous, self.dom).show();

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
                            if (page < numbers - 1) {
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
        self.link("getPages", { data: data }, function(err, pagesNr) {
            if (err) { 
                callback(err);
                return;
            }
            
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

    function read(fil, ops) {

        fil = fil || {};
        ops = ops || {};
        
        oldFilter = JSON.stringify(dbData.filter);
        newFilter = JSON.stringify(fil);
        
        var filter = JSON.parse(JSON.stringify(fil));
        var options = JSON.parse(JSON.stringify(ops));
        
        clearTable();
        
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

        // merge the configured filters
        if (config.options.filters && typeof config.options.filters === 'object') {
            data.filter = config.options.filters;
        } else {
            data.filter = {};
        }

        for (var i in filter) {
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
            if (!pagination) {
                render.call(self, data);    
            }
            else {
                showPage(page, dbData.filter, dbData.options);
            }
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
