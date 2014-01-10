M.wrap('github/jillix/jlx-layout/v0.0.1/layout.js', function (require, module, exports) {

var V = require('github/jillix/jlx-view/v0.0.1/view');

function init () {
    var self = this;
    //var config = self.mono.config;
    
    // set document title
    if (config.title) {
        document.title = config.title;
    }
    
    // init view
    if (config.view) {
        V(self)(config.view, function (err, layout) {
            
            // read data from server
            if (config.query) {
                layout.read(config.query, function (err, data) {
                    
                    // render html
                    layout.render(true);
                    self.emit('ready');
                });
            
            // set data
            } else {
                
                // set data
                if (config.data) {
                    layout.set(config.data);
                }
            
                // render html and append it to the dom
                layout.render(true);
                self.emit('ready');
            }
        });
    } else {
        self.emit('ready');
    }
}

module.exports = init;

return module;

});
