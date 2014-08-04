table
=====

Table module

#### View config
```json
"config": {
    "client": {
        "columns": [
            {
                "label": "Name",
                "prop": "object.property"
            }
        ],
        "req": {
            "q": {
                field: "value"
            },
            "o": {
                "limit": 20
            }
        },
        "route": "/path/{object.attribute}/path/"
    }
}
```
