const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const fs = require('fs');

const postRouter = require('./routes/post_router');
const Post = require('./models/post_model');
const dateAssembly = require("./date_assembly");

require('dotenv').config();

mongoose.connect(process.env.DB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true
}, async (err) => {
    if (err) throw err;
    console.log(`Connected to database on ${process.env.DB_URL}!`);

    try {
        var testPost = new Post({
            title: 'Music is awesome!',
            description: 'It\'s so cool.',
            date: dateAssembly(),
            author: 'Henry',
            markdown: fs.readFileSync('./sample.md')
        });
        await testPost.save();
    } catch(err) {}
});

const server = express();
const serverPort = process.env.SERVER_PORT;

server.set('view engine', 'ejs');
server.use(express.static('pages'));
server.use('/assets', express.static(path.join(__dirname, '../assets')));

server.listen(serverPort, () => {
    console.log(`Started server on port ${serverPort}!`);
});

server.get('/', (req, res) => {
    res.render('index');
});

server.get('/featured', (req, res) => {
    res.render('featured')
});

server.use('/posts', postRouter);