const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const fs = require('fs');

const postRouter = require('./routes/post_router');
const userRouter = require("./routes/user_router")
const Post = require('./models/post_model');
const User = require('./models/user_model');

const logRequests = require('./middleware/log_requests');
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken")

require('dotenv').config();

mongoose.connect(process.env.DB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true
}, async (err) => {
    if (err) throw err;
    console.log(`Connected to database on ${process.env.DB_URL}!`);
});

const SECRET = process.env.JWT_SECRET
const server = express();
const serverPort = process.env.SERVER_PORT;

server.set('view engine', 'ejs');
server.use(express.static('pages'));
server.use('/assets', express.static(path.join(__dirname, '../assets')));
server.use(logRequests);
server.use(express.json());

server.listen(serverPort, () => {
    console.log(`Started server on port ${serverPort}!`);
});

server.get('/', (req, res) => {
    res.render('index');
});

server.get('/featured', (req, res) => {
    res.render('featured')
});

server.get("/register", (req, res) => {
    res.render("register")
});

server.get("/login", async (req, res) => {
    res.render("login")
})

server.post("/login", async (req, res) => {
    var username = req.body.username;
    var pwd = req.body.pwd;
    var userDetails = await User.findOne({username})

    if (!userDetails) {
        res.json({status: "error", error: "invalid login details"})
        return
    }

    if (await bcrypt.compare(pwd, userDetails.password) == true) {
        var token = jwt.sign({id: userDetails._id, username: userDetails.username}, SECRET)
        res.json({status: "ok", data: token})
    } else res.json({status: "error", error: "invalid login details"})
})

server.post("/register", async (req, res) => {
    console.log(req.body);
    var pwd = await bcrypt.hash(req.body.pwd, 10);

    try {
        var newUser = new User({
            username: req.body.username,
            password: pwd,
        });
        await newUser.save();

        res.json({status: "ok"})
} catch(err) {
    if (err.code == "11000") {
        res.json({status: "error", error: "username already taken"})
    }
    res.json({status: "error", error: err})
}});

server.use('/posts', postRouter);
server.use("/users", userRouter);

server.use((req, res) => {
    res.status(404).render('../views/404');
});