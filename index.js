'use strict';

// Dependencies
const Events = require('events');
const render = require('./lib/render');
const state = require('./lib/state');

/*
 * Returns a flow-view instance
 *
 * example config
 * config = {
 *    "templates": {
 *        "name": {
 *            "to": "#css",
 *            "css": ["/path/file.css"],
 *            "httpClient": "http_client",
 *            "html": "/path/file.html",
 *            "title": "Document title",
 *            "position:" "beforebegin|afterbegin|beforeend|afterend"
 *            "clear": false,
 *            "leaveKeys": true,
 *            "dontEscape": false,
 *            "events": {
 *                "listener": [
 *                    {
 *                        "on": "event",
 *                        "sel": "#css",
 *                        "elm": "elmName",
 *                        "dontPrevent": true
 *                    }
 *                ]
 *            }
 *        }
 *    },
 *    "states": {
 *        "stateA": [
 *            {
 *                "sel": "#css",
 *                "element": "elmName",
 *                "states": ["stateB"],
 *                "rm": ["className"],
 *                "add": ["className"],
 *                "toggle": ["className"]
 *            }
 *        ]
 *    }
 * }
 */
module.exports = config => {
    let self = new Events();

    // create the config object
    config = config || {};
    self.config = {};
    self.config.states = config.states || {};
    self.config.templates = config.templates || {};

    // caches
    self.templates = {};
    self.htmls = {};

    // flow-view methods
    self.state = state;
    self.render = render;
    self.addStates = states => {
        Object.keys(states).forEach(stateName => {
            self.config.states[stateName] = states[stateName];
        });
    };
    self.addTemplates = templates => {
        Object.keys(templates).forEach(templateName => {
            self.config.templates[templateName] = templates[templateName]
        });
    };
    self.close = () => {
        window.close();
    };
    self.dom = key => {
        let path = key.split(':');

        // get find an element in the document
        path[0] = document.querySelector(path[0]);

        return path[0][path[1]] !== undefined ? path[0][path[1]] : path[0];
    }

    return self;
};
