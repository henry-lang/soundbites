var express = require('express');
var path = require('path');

var server = express();
var port = 3000;

server.set('view engine', 'ejs');

server.use(express.static('pages'))
server.use('/assets', express.static(path.join(__dirname, 'assets')))

server.listen(port, () => {
    console.log(`Server started on port ${port}!`);
});

server.get('/', (req, res) => {
    res.render('index');
});

server.get('/posts/:id', (req, res) => {
    var id = req.params.id;
    
    res.render('posts', {id: id});
});