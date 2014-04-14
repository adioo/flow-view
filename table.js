// dependencies
var Bind = require ("github/jillix/bind")
  , Events = require ("github/jillix/events")
  , Sort = require ("./sort")
  ;

/**
 *  Bind-table CRUD
 *  Bind-table module for CRUD.
 *
 */
function Table (module) {

    // global variables
    var self
      , config
      , container
      , template
      , needsTabindex = false
      ;

    function unflattenObject (flat) {
        var result = {};
        var parentObj = result;

        var keys = Object.keys(flat);
        for (var i = 0; i < keys.length; ++i) {
            var key = keys[i];
            var subkeys = key.split('.');
            var last = subkeys.pop();

            for (var ii = 0; ii < subkeys.length; ++ii) {
                var subkey = subkeys[ii];
                parentObj[subkey] = typeof parentObj[subkey] === 'undefined' ? {} : parentObj[subkey];
                parentObj = parentObj[subkey];
            }

            parentObj[last] = flat[key];
            parentObj = result;
        }

        return result;
    }

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
        if (!item) { return; }
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

    function clearTable() {
        $("." + config.options.classes.item, container).remove();
    }

    // ********************************
    // Public functions ***************
    // ********************************

    // table functions
    var dbData = {
            filter: {}
          , options: {}
        }
      , oldFilter = null
      , newFilter = null
      ;

    function read(fil, ops, callback) {

        fil = fil || {};
        ops = ops || {};
        callback = callback || function () {};

        oldFilter = JSON.stringify(dbData.filter);
        newFilter = JSON.stringify(fil);

        var filter = JSON.parse(JSON.stringify(fil));
        var options = JSON.parse(JSON.stringify(ops));

        clearTable();

        var data = {};
        data.options = options;

        data.filter = {};
        // merge the configured filters
        if (config.options.filters && typeof config.options.filters === "object") {
            for (var filter in config.options.filters) {
                if (!config.options.filters.hasOwnProperty(filter)) continue;
                data.filter[filter] = (config.options.filters || {})[filter];
            }
        }

        for (var key in filter) {
            if (!filter.hasOwnProperty(key)) continue;
            data.filter[key] = filter[key];
        }

        var query = data.filter || {};
        var options = data.options || {};

        var crudObj = {
            t: config.options.template,
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
            // don't clear table if there is a filter error
            if (err.message !== "FILTER_IS_BUSY") {
                clearTable();
            }
            self.clearTable = false;
            return;
        }

        if (self.clearTable || !config.options.infiniteScroll || (config.options.infiniteScroll && !config.options.infiniteScroll.skip)) {
            clearTable();
            self.clearTable = false;
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
            t: config.options.template,
            d: itemData
        };

        self.emit("insert", crudObj, function(err, data) {

            if (err) { return; }

            render.call(self, data);
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

        // set the new template
        self.config.options.template = templateObj._id;

        // default value for .table
        templateObj.options.table = templateObj.options.table || {};

        // clear sort
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
            if (!templObj.hasOwnProperty(key)) continue;

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
                spans.push($span.clone().html("<i class='fa fa-sort-up'></i> " + label));
                spans.push($span.clone().html("<i class='fa fa-sort-down'></i> " + label));

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
        var checkboxes = self.config.options.checkboxes || templateObj.options.table.checkboxes;

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

        // get checked items
        var $checked = $("." + config.options.classes.item + " .item-checkbox:checked").closest("tr");

        // if data is no true
        if (!data) {
            // return jQuery array
            return $checked;
        }

        // if data IS true, get the data items
        var checkedData = [];
        $checked.each(function () {
            checkedData.push($(this).data("dataItem"));
        });

        // and return them
        return checkedData;
    }

    /*
     *  Remove checked items from the table
     * */
    function removeChecked(options, callback) {

        // accept callback as first argument
        if (typeof options === "function") {
            callback = options;
            options = undefined;
        }

        // set defaults
        options = options || {};
        callback = callback || function () {};


        // get checked items
        var checkedItems = self.getChecked.call(self, true);

        // push each item id in ids
        var ids = [];
        for (var i = 0; i < checkedItems.length; ++i) {
            ids.push(checkedItems[i]._id);
        }

        // build the crud object
        var crudObj = {
            t: config.options.template,
            q: {
                _id: { "$in": ids }
            },
            o: { multi: true }
        };

        // remove via crud
        self.emit("remove", crudObj, function(err, data) {

            // handle error
            if (err) { return callback (err); }

            // get jQuery checked items
            var $checkedItems = self.getChecked.call(self);

            // remove them
            $checkedItems.remove();

            // and callback
            callback(err, data);
        });
    }

    function _sendRemove(itemData, callback) {

        // default value for callback
        callback = callback || function () {};

        // build query
        var query = {};

        // set the id
        query[config.options.id] = itemData[config.options.id];

        // build the crud object
        var crudObj = {
            t: config.options.template,
            q: query
        };

        // remove via crud
        self.emit("remove", crudObj, function(err, data) {

            // handle error
            if (err) { return callback(err); }

            // update ui
            $("#" + itemData[config.options.id]).remove();

            // callback the response
            callback(err, data);

        });
    }

    function removeItem(itemData, callback) {

        // default value for callback
        callback = callback || function () {};

        // no confirmation
        if (!config.options.deleteConfirmation) {
            // call _sendRemove
            _sendRemove(itemData, callback);
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

        // make sure that the object is an unflatten one
        var unflattenItem = unflattenObject (item);

        // update the dataItem cache
        $("#" + unflattenItem._id).data("dataItem", unflattenItem);

        // run the binds
        // TODO Remove `on` handlers
        for (var i = 0; i < config.template.binds.length; ++i) {
            var bindObj = config.template.binds[i];
            bindObj.context = $("#" + unflattenItem._id);
            Bind.call(self, bindObj, unflattenItem);
        }

        // emit `itemRefresh`
        self.emit ("itemRefreshed", unflattenObject);
    }

    function selectItem (dataItem) {

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

    var moduleMethods = {
        init: init,
        read: read,
        renderItemsFromResult: renderItemsFromResult,
        getSelected: getSelected,

        getChecked: getChecked,
        removeChecked: removeChecked,

        selectNext: selectNext,
        selectPrev: selectPrev,
        selectItem: selectItem,

        clearTable: clearTable,

        focusNext: focusNext,
        focusPrev: focusPrev,
        focusItem: focusItem,

        deselect: deselect,

        refreshItem: refreshItem,

        setTemplate: setTemplate,
        createItem: createItem,
        removeItem: removeItem,
        removeSelected: removeSelected,

        fetchNext: fetchNext,
        clearSkip: clearSkip,

        showItem: showItem,
        hideItem: hideItem,

        show: show,
        hide: hide
    };

    // create listen interface
    for (var meth in moduleMethods) {
        if (!moduleMethods.hasOwnProperty(meth)) continue;
        (function (method) {
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

    var table = new Table (module);

    for (var func in table) {
        if (!table.hasOwnProperty(func)) continue;
        table[func] = module[func] || table[func];
    }

    table = Object.extend(table, module);
    table.init(config);

    return table;
};
