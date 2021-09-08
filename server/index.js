import './config.js'

import express from 'express'
import rateLimit from 'express-rate-limit'
import https from 'https'
import path from 'path'
import fs from 'fs'
import mongoose from 'mongoose'
import {postEmitter} from './routes/post_router.js'

import cookieParser from 'cookie-parser'

import {postRouter} from './routes/post_router.js'
import userRouter from './routes/user_router.js'
import accountRouter from './routes/account_router.js'

import logRequests from './middleware/log_requests.js'
import {checkLogin} from './auth_utils.js'
import getPosts from './get_posts.js'

import {fileURLToPath} from 'url'
import {dirname} from 'path'
import PostModel from './models/post_model.js'
import {cache} from 'ejs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
var cachedPosts = null

const limitConfig = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 50,
    message: `You've been making too many requests, please try again later.`,
})

mongoose.connect(
    process.env.DB_URL,
    {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useCreateIndex: true,
    },
    async (err) => {
        if (err) throw err
        console.log(`Connected to database on ${process.env.DB_URL}!`)
        cachedPosts = await getPosts()
    }
)

const {SERVER_PORT, HTTPS_SERVER_PORT, PRIVKEY_PATH, FULLCHAIN_PATH} = process.env
const RUN_HTTPS = process.env.RUN_HTTPS === 'true'
const server = express()

server.set('view engine', 'ejs')
server.use('/assets', express.static(path.join(__dirname, '../assets')))
server.use(cookieParser())
server.use(checkLogin)
server.post('*', limitConfig)
server.use(logRequests)
server.use(express.json())

postEmitter.on('post', (data) => {
    cachedPosts.push(data)
    cachedPosts.sort((a, b) => {
        return b.epochTime - a.epochTime
    })
})

server.listen(SERVER_PORT, () => {
    console.log(`Started server on port ${SERVER_PORT}!`)
})

if (RUN_HTTPS)
    https
        .createServer(
            {
                key: fs.readFileSync(PRIVKEY_PATH),
                cert: fs.readFileSync(FULLCHAIN_PATH),
            },
            server
        )
        .listen(443, () => console.log(`Secure server started on port ${HTTPS_SERVER_PORT}!`))

server.get('/', (req, res) => {
    res.render('index', {posts: cachedPosts})
})

server.get('/featured', (req, res) => {
    res.render('featured')
})

server.get('/about', (req, res) => {
    res.render('about')
})

server.use('/posts', postRouter)
server.use('/users', userRouter)
server.use('/account', accountRouter)

server.use((req, res) => {
    res.status(404).render('../views/404')
})
