var fs = require('fs');
var M = process.mono;

var Crud = require(M.config.paths.MODULE_ROOT + 'github/jillix/jlx-crud/v0.0.1/main');

// get html snipptets (ws)
// TODO move this to jlx-view
function html (err, data) {
    var self = this;
    
    if (!data) {
        return self.emit('html', 'No path given');
    }
    
    var file = M.config.paths.PUBLIC_ROOT + data.replace(/[^a-z0-9\/\.\-_]|\.\.\//gi, "");
    fs.readFile(file, {encoding: 'utf8'}, function (err, data) {
        
        if (err) {
            return self.emit('html', 'File not found');
        }
        
        self.emit('html', null, data);
    });
}

function init (config) {
    var self = this;
    
    // init crud
    Crud(self);
    
    self.on('getHtml', html);
    //self.on('read', crud.read);
}

module.exports = init;
