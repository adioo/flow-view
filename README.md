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
        "resetNav": [{
            "sel": ".navbar li",
            "rm": ["active"]
          }],
        "nav": [{
            "states": ["resetNav"],
            "add": ["active"]
          }]
      },
      "domEvents": [{
          "on": "click",
          "selector": "li",
          "flow": "itemClick"
        }]
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

#### Footer visibility on certain pages
The footer will be a module view instance

```json
{
  "client": {
    "config": {
      "templates": {
        "layout": {
          "to": "footer",
          "html": "/any_footer.html",
          "render": true
        }
      },
      "defaultTemplate": "layout",
    },
    "markup": [
      "/any_footer.html"
    ]
  },
  "name": "footer_layout",
  "module": "view",
  "roles": {
    "*": true
  }
}
```
The main html file which contains and empty footer:
```html
<div id="page-content">
    <div class="_container hide"></div>
</div>
<footer></footer>

```
In the main composition, for ex. `private_layout.json`, `footer_layout` can be loaded and states can be used to control the footer visibility:
```
{
  "client": {
    "load": [
      "footer_private_layout"
    ]
    ......
    "states": {
        "showFooter": [{
            "sel": "footer",
            "rm": ["hide"]
    }],
        "hideFooter": [{
            "sel": "footer",
            "add": ["hide"]
        }]
}
```
In a view module instance composition in which the footer must be shown or hidden, the following flow configuration can be used:
```json
    "flow": [
      [
        "renderedDOM",
        [":private_layout/state", "showFooter"],
      ]
    ]
```
or
```json
    "flow": [
      [
        "renderedDOM",
        [":private_layout/state", "hideFooter"],
      ]
    ]
```
