const express = require('express');
const path = require('path');
const db = require('./database');
require('dotenv').config();

const server = express();
const serverPort = process.env.SERVER_PORT;

server.set('view engine', 'ejs');
server.use(express.static('pages'));
server.use('/assets', express.static(path.join(__dirname, 'assets')));

server.listen(serverPort, () => {
    console.log(`Started server on port ${serverPort}!`);
    db.init(process.env.DB_URL);
});

server.get('/', (req, res) => {
    res.render('index');
});

server.get('/posts/:id', (req, res) => {
    var id = req.params.id;
    // var data = 

    res.render('posts', {id: id});
});