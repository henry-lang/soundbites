require('dotenv').config()

const express = require('express')
const path = require('path')
const mongoose = require('mongoose')
const fs = require('fs')
const jwt = require('jsonwebtoken')
const cookieParser = require('cookie-parser')

const postRouter = require('./routes/post_router')
const userRouter = require('./routes/user_router')
const accountRouter = require('./routes/account_router')

const Post = require('./models/post_model')
const User = require('./models/user_model')

const logRequests = require('./middleware/log_requests')
const {checkLogin, requireLogin} = require('./auth_utils')

const { verify } = require('crypto')

mongoose.connect(process.env.DB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true
}, async (err) => {
    if (err) throw err
    console.log(`Connected to database on ${process.env.DB_URL}!`)
})

const SECRET = process.env.JWT_SECRET
const server = express()
const serverPort = process.env.SERVER_PORT



server.set('view engine', 'ejs')
server.use('/assets', express.static(path.join(__dirname, '../assets')))
server.use(cookieParser())
server.use(checkLogin)
server.use(logRequests)
server.use(express.json())

server.listen(serverPort, () => {
    console.log(`Started server on port ${serverPort}!`)
})

server.get('/', (req, res) => {
    res.render('index')
})

server.get('/featured', (req, res) => {
    res.render('featured')
})

server.use('/posts', postRouter)
server.use('/users', userRouter)
server.use('/account', accountRouter)

server.use((req, res) => {
    res.status(404).render('../views/404')
})