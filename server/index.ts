import './env.js'

import express from 'express'
import rateLimit from 'express-rate-limit'
import https from 'https'
import path from 'path'
import fs from 'fs'

import cookieParser from 'cookie-parser'

import {postRouter} from './routes/post_router.js'
import userRouter from './routes/user_router.js'
import accountRouter from './routes/account_router.js'

import logRequests from './middleware/log_requests.js'

import {fileURLToPath} from 'url'
import {dirname} from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const limitConfig = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 50,
    message: `You've been making too many requests, please try again later.`,
})

const server = express()

server.set('view engine', 'ejs')
server.use('/assets', express.static(path.join(__dirname, '../assets')))
server.use(cookieParser())
server.post('*', limitConfig)
server.use(logRequests)
server.use(express.json())

server.listen(process.env.SERVER_PORT, () => {
    console.log(`Started server on port ${process.env.SERVER_PORT}!`)
})

if (process.env.RUN_HTTPS)
    https
        .createServer(
            {
                key: fs.readFileSync(process.env.PRIVKEY_PATH),
                cert: fs.readFileSync(process.env.FULLCHAIN_PATH),
            },
            server
        )
        .listen(443, () => console.log(`Secure server started on port ${process.env.HTTPS_SERVER_PORT}!`))

server.get('/', (_req, res) => {
    res.render('index', {posts: []})
})

server.get('/featured', (_req, res) => {
    res.render('featured', {data: []})
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
