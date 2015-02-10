# view
A HTML and CSS renderer for jillix/engine.

####Client config example
```json
{
    "title": "Page title",
    "templates": {
        "layout": {
            "to": "#selector",
            "html": "/file.html",
            "flow": [{}],
            "render": true,
            "pages": true
        }
    },
    "states": {
        "stateA": [{
            "tmpl": "layout",
            "sel": "#new",
            "rm": ["className"],
            "add": ["className"],
            "toggle": ["className"]
        }]
    }
}
```
Don't forget to load the HTML templates files in the module instance config.
Example:
```json
{
    "name": "my_view_module_instance",
    "module": "",
    "client": {
        "html": ["/file.html"]
    }
}
```
####Public mehtods
* init (init the module instance)
* render (render data to a template)
* state (activate a state)