M.wrap('github/IonicaBizau/bind-table-crud/dev/table.js', function (require, module, exports) {
var Bind = require("github/jillix/bind");
var Events = require("github/jillix/events");
var Sort = require("./sort");

function List(module) {

    var self;
    var config;
    var container;
    var template;
    var pagination;
    var paginationNumbers = false;
    var page = 1;
    var needsTabindex = false;

    function processConfig(config) {

        config.binds = config.binds || [];
        config.template = config.template || {};
        config.template.binds = config.template.binds || [];
        config.cache = {
            templateBinds: JSON.parse(JSON.stringify(config.template.binds))
        };

        config.options = config.options || {};
        config.options.sort = config.options.sort || {};
        config.options.id = config.options.id || "id";
        config.options.showHidden = config.options.showHidden || false;
        config.options.noLinks = config.options.noLinks || false;

        if (config.options.tabindex) {
            needsTabindex = true;
        }

        /*
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
        */

        var optClasses = config.options.classes || {}
        optClasses.item = optClasses.item || "item";
        optClasses.selected = optClasses.selected || "selected";
        config.options.classes = optClasses;

        if (config.options.sort) {
            Sort.init.call(self, self);
        }

        if (config.options.infiniteScroll) {
            config.options.infiniteScroll.skip = 0;

            if (!config.options.infiniteScroll.automatic) {

                // insert a new bind in binds
                config.binds.push({
                    "target": ".load-more-btn",
                    "on": [{
                        "name": "click",
                        "handler": "fetchNext"
                    }]
                });

                // TODO Configurable from descriptor
                var $infiniteScroll = $(".infinite-scroll", self.dom);
                var $loadMoreBtn = $infiniteScroll.find(".load-more-btn");
                var $loading = $loadMoreBtn.find(".loading");
                var $loaded = $loadMoreBtn.find(".loaded");

                config.options.infiniteScroll.domRefs = {
                    container: $infiniteScroll,
                    loadMoreBtn: $loadMoreBtn,
                    loading: $loading,
                    loaded: $loaded
                };

                // get count
                var count = config.options.infiniteScroll.count;

                // if it a number
                if (typeof count === "number") {
                    // set filter's limit
                    self.emit("setOptions", {limit: count});
                };
            }
            // TODO Automatic scroll
        }

        return config;
    }

    function init(conf) {
        // initialize the globals
        self = this;

        // process config
        config = processConfig(conf);

        // call events
        Events.call(self, config);

        self.config = config;
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
        for (var i = 0; i < binds.length; ++i) {
            Bind.call(self, binds[i]);
        }

        // run the binds
        for (var i = 0; i < config.binds.length; ++i) {
            Bind.call(self, config.binds[i]);
        }


        if (config.options.autofetch) {
            self.read({}, { sort: config.options.sort }, function() {
                self.emit("ready");
            });
        } else {
            self.emit("ready");
        }

        $(self.dom).on("keydown", "tr:focus", function (event) {
            switch (event.keyCode) {
                // key up
                case 38:
                    if ($(this).prev().length) {
                        focusPrev();
                        event.preventDefault();
                    }
                    break;
                // key down
                case 40:
                    if ($(this).next().length) {
                        focusNext();
                        event.preventDefault();
                    }
                    break;
                // key left
                case 37:
                    selectPrev();
                    event.preventDefault();
                    break;
                // key right
                case 39:
                    selectNext();
                    event.preventDefault();
                    break;
                // enter
                case 13:
                    $("tr:focus").click();
                    event.preventDefault();
                    break;
            }
        });
    }

    function render (item) {
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
            .data("dataItem", item)
            .show();

        if (needsTabindex) {
            newItem.attr("tabindex", config.options.tabindex);
            needsTabindex = false;
        }

        for (var i = 0; i < config.template.binds.length; ++i) {
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

        for (var i = 0; i < pagination.dom.pages.length; ++i) {
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
            t: config.options.type,
            q: query,
            o: options,
            f: {
                "$all": 1,
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
            for (var filter in config.options.filters) {
                if (!config.options.filters.hasOwnProperty(filter)) return;
                data.filter[filter] = (config.options.filters || {})[filter];
            }
        }

        for (var key in filter) {
            if (!filter.hasOwnProperty(i)) return;
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
            t: config.options.type,
            q: query,
            o: options
        };

        if (self.config.options.noLinks) {
            crudObj.noMerge = true;
        }

        self.emit("find", crudObj, function(err, data) {
            renderItems(err, data);
            callback(err, data);
        });
    }

    function renderItemsFromResult (err, data) {

        if (err) {
            clearList();
            self.clearList = false;
            return;
        }

        if (self.clearList || !config.options.infiniteScroll || (config.options.infiniteScroll && !config.options.infiniteScroll.skip)) {
            clearList();
            self.clearList = false;
        }

        if (config.options.infiniteScroll) {
            // if count is undefined
            if (config.options.infiniteScroll.count === undefined) {
                config.options.infiniteScroll.count = data.length;
            }

            // update ui
            if (!config.options.infiniteScroll.automatic) {
                var infDomRefs = config.options.infiniteScroll.domRefs;
                infDomRefs.loading.hide();
                infDomRefs.loaded.show();
                if (!data || !data.length || data.length < config.options.infiniteScroll.count) {
                    infDomRefs.loadMoreBtn.attr("disabled", "");
                } else {
                    infDomRefs.loadMoreBtn.removeAttr("disabled");
                }
            } else {
                // TODO Automatic scroll
            }
        }

        if (pagination) {
            alert("Pagination not yet implemented using bind-filter... :-(");
            // TODO
            // var size = pagination.size;
            // var skip = (page - 1) * size;

            // options.limit = options.size || size;
            // options.skip = options.skip || skip;

            // setDisabled(filter, options);
        }

        renderItems(err, data);
    }

    function renderItems (err, data) {

        if (err) { return; }

        if (!data || !data.length) {
            return;
        }

        for (var i = 0, l = data.length; i < l; ++i) {
            render.call(self, data[i]);
        }

        var autoselect = self.config.options.autoselect;

        var infiniteScroll = self.config.options.infiniteScroll;
        if (infiniteScroll && infiniteScroll.autoselect) {
            autoselect = infiniteScroll.autoselect;
            infiniteScroll.autoselect = undefined;
        }

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

    function createItem (itemData) {

        var crudObj = {
            t: config.options.type,
            d: itemData
        };

        self.emit("insert", crudObj, function(err, data) {

            if (err) { return; }

            if (!pagination) {
                render.call(self, data);
            } else {
                showPage(page, dbData.filter, dbData.options);
            }
        });
    }

    /*
     *  This function will set the template of table
     *  --------------------------------------------
     *  Receives as first argument a template object.
     *
     *  Example of object:
     *  {
     *     _id:                    {type:string, required:true, default:null}
     *     _ln._id:                {type:string, default:null}
     *     _ln._tp:                {type:string, default:null}
     *     _tp:                    {type:string, required:true, default:null}
     *     address.city:           {type:string, default:null}
     *     address.street:         {type:string, default:null}
     *     address.zip:            {type:string, max:9999, min:1000, default:null}
     *     cc.comments:            {type:string, default:null}
     *     cc.last_contact.by:     {type:string, default:null}
     *     cc.last_contact.date:   {type:string, default:null}
     *     cc.no_call:             {type:string, default:null}
     *     cc.no_contact:          {type:string, default:null}
     *     cc.phone_busy:          {type:string, default:null}
     *     cc.wrong_phone:         {type:string, default:null}
     *     company:                {type:string, default:null}
     *     dd.branch:              {type:string, default:null}
     *     dd.crn:                 {type:string, default:null}
     *     dd.gf:                  {type:string, default:null}
     *     dd.region:              {type:string, default:null}
     *     dd.sow:                 {type:string, default:null}
     *     email:                  {type:string, default:null}
     *     lang:                   {type:string, default:null}
     *     name.first:             {type:string, default:null}
     *     name.last:              {type:string, default:null}
     *     name.role:              {type:string, default:null}
     *     tel:                    {type:string, default:null}
     *  }
     *
     *  The following columns will be generated:
     *
     *  +--------------+----------------+-----+-----+
     *  | address.city | address.street | ... | tel |
     *  +--------------+----------------+-----+-----+
     *  |        Here will come the data rows       |
     *  +-------------------------------------------+
     * */

    function setTemplate (templateObj) {

        Sort.clear.call(self);

        needsTabindex = config.options.tabindex ? true : false;

        if (config.options.infiniteScroll) {
            config.options.infiniteScroll.skip = 0;
        }

        var templObj = templateObj.schema;
        var $table = $(config.table, self.dom);

        if (!$table.length) {
            console.error("No table set. Set it as config.table in the module config.");
            return;
        }

        var $thead = $table.find("thead");
        var $htr = $("<tr>");
        var $template = $("<tr>");

        //$template.attr("tabindex", config.options.tabindex);

        var binds = [];

        var orderedFields = [];

        for (var key in templObj) {
            if (!templObj.hasOwnProperty(key)) return;

            // do not display core properties
            if (self.config.options.noLinks) {
                if (key[0] === '_' || templObj[key].link) continue;
            } else {
                if (key[0] === "_") {
                    continue;
                }
            }


            // do not display hidden properties
            if (!self.config.options.showHidden && templObj[key].hidden) {
                continue;
            }

            // with i18n labels from the schema
            var label = templObj[key].label;
            if (label && typeof label === "object") {
                label = label[M.getLocale()];
            }
            // if no label defined in the schema or no label for the current locale, use the key
            label = label || key;

            orderedFields.push({ key: key, label: label, value: templObj[key]});
        }

        orderedFields.sort(function(f1, f2) {
            if (f1.value.order < f2.value.order) {
                return -1;
            } else if (f1.value.order > f2.value.order) {
                return 1;
            } else {
                return f1.label <= f2.label ? -1 : 1;
            }
        });

        Sort.setSortCount.call(self, orderedFields.length);
        for (var i = 0; i < orderedFields.length; ++i) {
            // build heads of table
            var $th = $("<th>");
            var cField = orderedFields[i];
            var label = cField.label;

            if (orderedFields[i].value.nosort) {
                $th.attr("data-nosort", "true");
            }

            if (!config.options.sort) {
                $th.text(label);
            }
            else {
                // sort settings
                var $span = $("<span>")
                                .addClass("sort")
                                .attr("data-key-sort", cField.key)
                                .hide();

                // nonsorted, sorted1, sorted2
                var spans = [];

                spans.push($span.clone().text(label));
                spans.push($span.clone().html("<i class='icon-sort-up'></i> " + label));
                spans.push($span.clone().html("<i class='icon-sort-down'></i> " + label));

                var sort = (templateObj.options || {}).sort;
                if (sort && sort[0] && sort[0][0] === cField.key) {
                    Sort.setSort.call(self, sort[0]);
                    var direction = sort[0][1] === 1 ? 1 : 2;
                    spans[direction].show();
                }
                else {
                    spans[0].show();
                }

                spans[0].data("sort", [cField.key, 0]).addClass("sort0");
                spans[1].data("sort", [cField.key,  1]).addClass("sort1");
                spans[2].data("sort", [cField.key, -1]).addClass("sort-1");

                $th.append(spans);
            }
            $htr.append($th);

            // build the template
            var $td = $("<td>");
            $td.attr("data-field", orderedFields[i].key);
            $td.attr("data-type", orderedFields[i].value.type);
            $template.append($td);

            // build binds
            var newBind = {
                target: "[data-field='" + orderedFields[i].key + "']",
                html: {
                    source: orderedFields[i].key,
                    "default": ""
                }
            };

            if (orderedFields[i].value.filter) {
                newBind.html.filter = orderedFields[i].value.filter;
            }

            binds.push(newBind);
        }

        // get checkboxes from options
        var checkboxes = self.config.options.checkboxes;
        // TODO move to descriptor
        checkboxes = {
            position: "last"
        };

        // chekboxes option is set
        if (checkboxes) {
            // last --> append, first ---> prepend
            var how = checkboxes.position === "last" ? "append" : "prepend";

            // create the jQuery object
            var $checkbox = $("<input>").attr("type", "checkbox");

            var HEADER_CHECKBOX_CLASS = "header-checkbox";
            var ITEM_CHECKBOX_CLASS = "item-checkbox";

            // append/prepend the checkbox
            var $checkTh = $("<th>").append($checkbox.clone().addClass(HEADER_CHECKBOX_CLASS));

            // (un)check all handler
            $("." + HEADER_CHECKBOX_CLASS, $checkTh).on("change", function () {
                $("." + ITEM_CHECKBOX_CLASS, self.dom).prop("checked", $(this).prop("checked"));
            });

            $htr[how]($checkTh);

            // ...and to tempalte
            var $checkTd = $("<td>").append($checkbox.clone().addClass(ITEM_CHECKBOX_CLASS));
            $template[how]($checkTd);
        }


        config.template.binds = config.cache.templateBinds.concat(binds);
        config.template.type = "selector";

        template = $template.clone();
        $thead.html("");
        $thead.append($htr);
        self.emit("templateSet", config.template);
    }


    /*
     *  Get checked items in the table
     * */
    function getChecked (data) {

        var $checked = $("." + config.options.classes.item + " .item-checkbox:checked").closest("tr");

        if (!data) {
            return $selected;
        }

        var selectedData = [];
        $selected.each(function () {
            selectedData.push($(this).data("dataItem"));
        });

        return selectedData;
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

    function refreshItem (err, item) {

        if (err) {
            alert(err);
            return;
        }

        // TODO Change this when bind-filter will an object in a different format
        if (item._id && item.bindFilterMessage === "hide") {
            return hideItem(item);
        }

        if (item._id && item.bindFilterMessage === "show") {
            showItem(item);
        }

        var res = {};
        (function recurse(obj, current) {
          for (var key in obj) {
            if (!obj.hasOwnProperty(key)) return;

            var value = obj[key];
            var newKey = (current ? current + "." + key : key);  // joined key with dot
            if(value && typeof value === "object") {
              recurse(value, newKey);  // it's a nested object, so do it again
            } else {
              res[newKey] = value;  // it's not an object, so set the property
            }
          }
        })(item);

        // run the binds
        // TODO Remove `on` handlers
        for (var i = 0; i < config.template.binds.length; ++i) {
            var bindObj = config.template.binds[i];
            bindObj.context = $("#" + item._id);
            Bind.call(self, bindObj, item);
        }
    }

    function selectItem (dataItem) {

        if (!dataItem) {
            return;
        }

        if (dataItem instanceof jQuery) {
            dataItem = getDataItem(dataItem);
            selectItem(dataItem);
        }

        var selectedClass = config.options.classes.selected;

        switch (config.options.selection) {

            case "single":
                var currentItem = $("#" + dataItem[config.options.id], container);
                if (currentItem.hasClass(selectedClass) && config.options.safeSelection) {
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

        focusItem(dataItem);
    }

    function getDataItem (jQueryObject) {
        return jQueryObject.data("dataItem");
    }

    function focusItem (dataItem) {

        if (!dataItem) {
            return;
        }

        $("." + config.options.classes.item, module.dom).removeAttr("tabindex");
        $("#" + dataItem[config.options.id], module.dom).attr("tabindex", config.options.tabindex).focus();
    }

    function showItem (dataItem) {
        $("#" + dataItem._id).fadeIn();
    }

    function hideItem (dataItem) {
        $("#" + dataItem._id).fadeOut();
    }

    function show () {
        $(self.dom).parent().show();
    }

    function hide () {
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

    function getSelected (data) {

        var $selected = $("." + config.options.classes.item + "." + config.options.classes.selected);

        if (!data) {
            return $selected;
        }

        var selectedData = [];
        $selected.each(function () {
            selectedData.push($(this).data("dataItem"));
        });

        return selectedData;
    }

    function selectNext () {

        if (config.options.selection !== "single") {
            return console.error("Cannot select next if selection is non single.");
        }

        var $selected = getSelected();
        var $next = $selected.next();
        if (!$next.length) {

            if (self.config.options.infiniteScroll) {
                fetchNext();
                self.config.options.infiniteScroll.autoselect = 1;
                return;
            }

            // TODO Next page
            return;
        }
        selectItem($next);
    }

    function selectPrev () {
        if (config.options.selection !== "single") {
            return console.error("Cannot select next if selection is non single.");
        }

        var $selected = getSelected();
        var $prev = $selected.prev();
        // TODO Prev page
        if (!$prev.length) { return; }
        selectItem($prev);
    }

    function focusPrev () {
        _focus('prev');
    }

    function focusNext () {
        _focus('next');
    }

    function _focus (direction) {
        // get the focused item using the configured class for items
        var $focused = $("." + config.options.classes.item + ":focus");

        // no focus, no fun
        if ($focused.length === 0) {
            return;
        }

        var $target = $focused[direction]("." + config.options.classes.item);

        // no more item to focus on
        if (!$target.length) {
            fetchNext();
            return;
        }

        // move the tabindex attribute in order to come back to this item
        $focused.removeAttr("tabindex");
        $target.attr("tabindex", config.options.tabindex);

        // and finally we focus!
        $target.focus();

        // fetch more if the focused item is the last
        if (!$target.next().length) {
            fetchNext();
        }
    }

    /**
     *  Load more data in data table
     *
     *  This can be used only when infinite scroll is set
     *
     * */
    function fetchNext () {
        config.options.infiniteScroll.skip += config.options.infiniteScroll.count;

        var options = {
            skip: config.options.infiniteScroll.skip,
            limit: config.options.infiniteScroll.count
        };

        if (!config.options.infiniteScroll.automatic) {
            var infDomRefs = config.options.infiniteScroll.domRefs;
            infDomRefs.loading.show();
            infDomRefs.loaded.hide();
            infDomRefs.loadMoreBtn.attr("disabled", "");
        } else {
            // TODO Automatic scroll
        }

        // set bind filter options
        //  reset: false,
        //  callFind: true
        //
        //  The bind-crud-table module will listen for `result` event emited
        //  by bind-filter and will render the items (renderItemsFromResult function)
        self.emit("setOptions", options, false, true);
    }

    function clearSkip () {
        if (!config.options.infiniteScroll) { return; }
        config.options.infiniteScroll.skip = 0;
    }

    function emptyPagination() {
        $("." + pagination.numbers.classes.item).remove();
        pagination.dom.pages = [];
    }

    return {
        init: init,
        read: read,
        renderItemsFromResult: renderItemsFromResult,
        getSelected: getSelected,
        getChecked: getChecked,

        selectNext: selectNext,
        selectPrev: selectPrev,
        selectItem: selectItem,

        focusNext: focusNext,
        focusPrev: focusPrev,
        focusItem: focusItem,

        deselect: deselect,

        refreshItem: refreshItem,

        setTemplate: setTemplate,
        createItem: createItem,
        removeItem: removeItem,
        removeSelected: removeSelected,

        goToNextPage: goToNextPage,
        goToPrevPage: goToPrevPage,
        fetchNext: fetchNext,
        clearSkip: clearSkip,
        showPage: showPage,
        emptyPagination: emptyPagination,

        showItem: showItem,
        hideItem: hideItem,

        show: show,
        hide: hide
    };
}

module.exports = function (module, config) {

    var list = new List(module);

    for (var func in list) {
        if (!list.hasOwnProperty(func)) return;
        list[func] = module[func] || list[func];
    }

    list = Object.extend(list, module);
    list.init(config);

    return list;
};

return module; });
