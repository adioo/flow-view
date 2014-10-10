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

# Model Queries

The module needs the following model queries defined in models. Being a [`filters`](https://github.com/IonicaBizau/engine-filters) dependent, you may check the [model queries from there too](https://github.com/IonicaBizau/engine-filters/blob/master/README.md#model-queries).

## `count`

Needed only when using pagination feature.

```js
{
    "queries": [
        {
            "name": "count",
            "request": {
                "method": "count"
            },
            "add": {
                "query": "q"
            }
        }
    ]
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
