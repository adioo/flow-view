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
    "states": {
        "stateA": [{
            "sel": "#new",
            "element": "myElement",
            "states": ["stateB"],
            "rm": ["className"],
            "add": ["className"],
            "toggle": ["className"]
        }]
    },
    "domEvents": [
        {
            "on": "click",
            "selector": "#my_clickable_1",
            "dontPrevent": true,
            "flow": "event"
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

# Implementing standard configurations
This section covers "how to do" general configurations.


#### Navbars

The navbar will be an instance of the view module.

Practical example:
The composition file of the navbar `nav_layout`:

```json
{
  "client": {
    "config": {
      "templates": {
        "layout": {
          "to": ".one-container",
          "html": "/nav.html",
          "render": true
        }
      },
      "defaultTemplate": "layout",
      "states": {
        "resetNav": [
          {
            "sel": ".navbar li",
            "rm": [
              "active"
            ]
          }
        ],
        "nav": [
          {
            "states": [
              "resetNav"
            ],
            "add": [
              "active"
            ]
          }
        ]
      },
      "domEvents": [
        {
          "on": "click",
          "selector": "li",
          "flow": "itemClick"
        }
      ]
    },
    "flow": [
      [
        "itemClick",
        [":ALTR", {"data": {"url": "{event.target.href}"}}],
        ":public_router/route"
      ]
    ],
    "markup": [
      "/nav.html"
    ]
  },
  "name": "nav_layout",
  "module": "view",
  "roles": {
    "*": true
  }
}
```
The states are for adding the active class to the active `li`.
The 'domEvents' triggers the 'itemClick' event on item click.
The 'flow', on `itemClick` event, takes the href of the clicked element and sends it to an instance of the engine-ruut module.

Html navbar example `nav.html`:

```html
<ul class="navbar">
    <li><a href="faq">FAQ</a></li>
    <li><a href="features">Features</a></li>
    <li><a href="pricing">Pricing</a></li>
    <li><a href="signin">Login</a></li>
    <li><a href="signup">Sign up</a></li>
</ul>
```

To use the navbar in a view module instance it must be loaded:
```json
{
  "client": {
    "load": [
      "nav_layout",
    ],
    "config": {
    },
    "markup": [
    ]
  },
  "roles": {
    "*": true
  },
  "module": "view",
  "name": "public_layout"
}
```
