// TODO bind content
//var Bind = require('github/jillix/bind');

function init (config) {
    var self = this;
    
    // set document title
    if (config.title) {
        document.title = config.title;
    }
    
    // TODO bind content
    //if (config.binds) {
    //    for (var i = 0; i < config.binds.length; ++i) {
    //        Bind.call(self, config.binds[i]);
    //    }
    //}
}

module.exports = init;
