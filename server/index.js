import './config.js'

import express from 'express'
import path from 'path'
import mongoose from 'mongoose'

import cookieParser from 'cookie-parser'

import postRouter from './routes/post_router.js'
import userRouter from './routes/user_router.js'
import accountRouter from './routes/account_router.js'

import logRequests from './middleware/log_requests.js'
import {checkLogin} from './auth_utils.js'
import getPosts from './get_posts.js'

import {fileURLToPath} from 'url'
import {dirname} from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

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
    }
)

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
    getPosts().then((result) => {
        res.render('index', {posts: result})
    })
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
