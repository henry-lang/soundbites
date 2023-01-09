import './env.js'

import express from 'express'
import rateLimit from 'express-rate-limit'
import https from 'https'
import path from 'path'
import fs from 'fs'
import mongoose from 'mongoose'

import cookieParser from 'cookie-parser'

import {postRouter, postEmitter} from './routes/post_router'
import userRouter from './routes/user_router'
import accountRouter from './routes/account_router'

import logRequests from './middleware/log_requests'
import {checkLogin} from './auth'
import getPosts from './get_posts'

import {fileURLToPath} from 'url'
import {dirname} from 'path'
import UserModel from './models/user_model'
import { env } from './env'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
let cachedPosts = null

const limitConfig = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 50,
    message: `You've been making too many requests, please try again later.`,
})

// Idk
mongoose.set('strictQuery', true);
mongoose.connect(
    env.DB_URL,
    {},
    async (err) => {
        if (err) throw err
        console.log(`Connected to database on ${process.env.DB_URL}!`)
        cachedPosts = await getPosts()
    }
)

const server = express()

server.set('view engine', 'ejs')
server.use('/assets', express.static(path.join(__dirname, '../assets')))
server.use(cookieParser())
server.use(checkLogin)
server.post('*', limitConfig)
server.use(logRequests)
server.use(express.json())

postEmitter.on('post', async (data) => {
    data.author = await UserModel.findById(data.author)
    console.log(data.author)
    cachedPosts.push(data)
    cachedPosts.sort((a, b) => {
        return b.epochTime - a.epochTime
    })
})

server.listen(env.SERVER_PORT, () => {
    console.log(`Started server on port ${env.SERVER_PORT}!`)
})

if (env.RUN_HTTPS)
    https
        .createServer(
            {
                key: fs.readFileSync(env.PRIVKEY_PATH),
                cert: fs.readFileSync(env.FULLCHAIN_PATH),
            },
            server
        )
        .listen(443, () => console.log(`Secure server started on port ${env.HTTPS_SERVER_PORT}!`))

server.get('/', (_req, res) => {
    res.render('index', {posts: cachedPosts})
})

server.get('/featured', (_req, res) => {
    res.render('featured', {data: cachedPosts})
})

server.get('/about', (_req, res) => {
    res.render('about')
})

server.use('/posts', postRouter)
server.use('/users', userRouter)
server.use('/account', accountRouter)

server.use((_req, res) => {
    res.status(404).render('../views/404')
})
