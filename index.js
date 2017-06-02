"use strict";

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

// Dependencies
const Events = require("events");
const render = require("./lib/render");
const state = require("./lib/state");

// TODO use a service worker
const View = {
    templates: {},
    snippets: {},
    listeners: [],
    close: window.close,
    dom: (key) => {
        key = key.split(":");
        key[0] = document.querySelector(key[0]);
        return key[0][key[1]] !== undefined ? key[0][key[1]] : key[0];
    }
};

// onevent will be called on dom events

View.render = render(View);
View.state = state(View);
module.exports = Object.freeze(View);

 /*
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
 */
