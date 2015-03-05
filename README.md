# view
A HTML and CSS renderer for jillix/engine.

####Client config example
```json
{
    "title": "Page title",
    "template": {
        "to": "#selector",
        "html": "/file.html",
        "render": true,
        "pages": true
    },
    "states": {
        "stateA": [{
            "sel": "#new",
            "rm": ["className"],
            "add": ["className"],
            "toggle": ["className"]
        }]
    }
}
```
Don't forget to load the HTML files in the module instance config.
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
* render (render data to a template)
* state (activate a state)
