const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const fs = require('fs');

const postRouter = require('./routes/post_router');
const userRouter = require("./routes/user_router")
const Post = require('./models/post_model');
const User = require('./models/user_model');
const dateAssembly = require("./date_assembly");

const logRequests = require('./middleware/log_requests');

require('dotenv').config();

mongoose.connect(process.env.DB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true
}, async (err) => {
    if (err) throw err;
    console.log(`Connected to database on ${process.env.DB_URL}!`);

    try {
        var testPost = new User({
            username: "alksdjflk",
            password: "ajsdlkfj",
            displayName: "Test",

        });
        await testPost.save();
    } catch(err) {}
});

const server = express();
const serverPort = process.env.SERVER_PORT;

server.set('view engine', 'ejs');
server.use(express.static('pages'));
server.use('/assets', express.static(path.join(__dirname, '../assets')));
server.use(logRequests);

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
server.use("/users", userRouter);

server.use((req, res) => {
    res.status(404).render('../views/404');
});