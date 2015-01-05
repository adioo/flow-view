Bind-list CRUD
==============

CRUD Version of bind-list module

No datasources needed.

### Change Log

#### v0.2.2
 - Update data cache after update request.

#### v0.2.1
 - Removed `contructor.name` for IE compatibility
 - Updated to Bind `v0.3.1`

#### v0.2.0
 - Updated deps

#### v0.1.7
 - Added `getSelected` method
 - Added communication via events
 - Attach methods to `self`
 - Fetch item from server when `selectItem` is called and the item is not on the client.

#### v0.1.6
 - Added `updateItem` function

#### v0.1.5
 - Events v0.1.8 and Bind v0.2.1

#### v0.1.4
 - Added `itemsReneder` event that is emited after the items are rendered.
 - `callback` argument in `createItem` function

#### v0.1.3
 - Fixed the deleting query

#### v0.1.2
 - Store template in `config.options.template`
 - Handle arrays passed in `renderSelector` function

#### v0.1.1
 - `setTemplate` method

#### v0.1.0
 - Initial versioned release
