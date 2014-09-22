Engine List
===========

List module for Engine framework.

# Configuration
```js
{
    "roles": ENGINE_ROLES,
    "name": "instance_name",
    "links": [
        {
            "event": "m>",
            "call": "_request"
        }
    ],
    "config": {
        "client": {
            "autoinit": true,
            "model": "foo",
            "item": {
                "on": {
                    "data": "Z.filters.foo.item.data"
                },
                "id": "id"
            },
            "pagination": {
                "size": 8,
                "classes": {
                    "disabled": "disabled",
                    "next": "next-page",
                    "prev": "prev-page",
                    "active": "active",
                    "item": "page-item"
                },
                "numbers": {
                    "max": 3,
                    "aFirst": true,
                    "aLast": true
                }
            },
            "filters": "foo_filters"
        }
    },
    "module": "github_ionicabizau_list_v0.0.1"
}
```

# Methods

## `read(event, data)`
Read and renders data.

`data` argument should contain:
 - `q`: the query object
 - `o`: the options object

Data can be passed via `event` parameter, the second argument being used as `callback` function.

## `getItem(event, data)`
**Not stable yet**

## `ui.render(items)`
Renders data passed in first argument.

## `pagination.update(event, data)`
Updates pagination numbers

## `pagination.select(event, data)`
Selects a page

## `pagination.selectNext(event, data)`
Selects the next page

## `pagination.selectPrev(event, data)`
Selects the previous page

# License
See the [LICENSE](./license) file.
