var express = require('express');
var path = require('path');

var server = express();
var port = 3000;

server.use(express.static('pages'))
server.use('/assets', express.static(path.join(__dirname, 'assets')))

server.listen(port, function() {
    console.log(`Server started on port ${port}!`);
});

server.get('/', function(req, res) {
    res.sendFile('pages/index.html', {root: __dirname});
});