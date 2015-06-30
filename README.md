# view
A HTML renderer for jillix/engine.

#### Client config example

```json
{
    "title": "Page title",
    "template": {
        "template_1": {
            "to": "#selector",
            "html": "/file_1.html",
            "render": true,
            "element": "customDataAttribute"
        },
        "template_2": {
            "to": "#selector",
            "html": "/file_2.html",
            "render": false,
            "element": "customDataAttribute"
        }
    },
    "detaultTemplate": "template_2",
    "flow": [
        {
            "on": "click",
            "selector": "#my_clickable_1",
            "call": "foo",
            "to": "target_instance",
            "data": ["bar", {}]
        },
        {
            "on": "click",
            "element": "clickable_2",
            "dontPrevent": true,
            "emit": "an_event"
        }
    ]
}
```

Don't forget to load the HTML files in the module instance config:

```json
{
    "name": "my_view_module_instance",
    "module": "view",
    "client": {
        "markup": ["/file.html"]
    }
}
```

#### HTML data attribute

The `element` flow option searches for elements that have a `data-element` attribute with that value.

```html
<div data-element="myElement"></div>
```

#### Public mehtods

* `render` (render data to a template)
* `state` (activate a state)
