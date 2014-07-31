Bind-table CRUD
===============

Bind-table module for CRUD.


## Change Log

### dev

### v0.2.0
 - Updated deps

### v0.1.19
 - Fixed `selectItem` method.

### v0.1.18
 - Added `renderedItems` event
 - Fetch item from server when `selectItem` is called and the item is not on the client.

### v0.1.17
 - Refresh the table if the item doesn't exist when running `updateItem`.

### v0.1.16
 - Updated Events to `v0.1.11` since `v0.1.10` was using a bad version of Utils

### v0.1.15
 - Updated Bind to `v0.2.2` and Events to `v0.1.10`

### v0.1.14
 - Get selected items from `self.dom`

### v0.1.13
 - Upgraded to Events@v0.1.9
 - Attach methods to self

### v0.1.12
 - Fixed a bug from v0.1.11

### v0.1.11
 - Emit the unflatten object when the item is refreshed

### v0.1.10
 - emit `itemRefreshed` after the item was refreshed
 - update the `dataItem` cache on refresh item

### v0.1.9
 - Use FA4 classes

### v0.1.8
 - convert objects to unflatten objects in `refreshItem` method
 - removed pagination functions
 - replaced `clearList` with `clearTable`

### v0.1.7
 - Upgrade to Events v0.1.8 and Bind v0.2.1

### v0.1.6
 - don't render the item if it's `null`, `undefined` etc.

### v0.1.5
 - Use callbacks to get values returned by called functions using events.

### v0.1.4
 - Access any public function using events

### v0.1.3
 - Added `clearList` as public function

### v0.1.2
 - Don't clear the list when filter is busy.

### v0.1.1
 - Set undefined for no-sort sort array (#15).

### v0.1.0
 - Initial versioned release

