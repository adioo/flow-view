joint
=====

Add custom events and functionality to an mono application.

####Example instance configuration
```json
{
    "client": {
        "events": [
            "myCustomEvent"
        ],
        "scripts": [
            "/customClient.js"
        ],
        "data": {
            "module": "M.my.custom.module",
            "config": {}
        }
    },
    "server": {
        "events": [
            "myCustomEvent"
        ],
        "data": {
            "module": "customServer.js",
            "config": {}
        }
    }
}
```
