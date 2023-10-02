import './config.js'

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
import {checkLogin} from './auth_utils.js'

import {fileURLToPath} from 'url'
import {dirname} from 'path'

import {PrismaClient} from '@prisma/client'
import helmet from 'helmet';

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

export const prisma = new PrismaClient({log: ['query', 'info', 'warn', 'error']})

const limitConfig = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 50,
    message: `You've been making too many requests, please try again later.`,
})

const {SERVER_PORT, HTTPS_SERVER_PORT, PRIVKEY_PATH, FULLCHAIN_PATH} = process.env
console.log(PRIVKEY_PATH, FULLCHAIN_PATH);
const RUN_HTTPS = process.env.RUN_HTTPS === 'true'
const server = express()

server.set('view engine', 'ejs')
server.use('/assets', express.static(path.join(__dirname, '../assets')))
server.use(express.static(path.join(__dirname, '../assets'))) // for certbot to give us https
server.use(cookieParser())
server.use(checkLogin)
server.post('*', limitConfig)
server.use(logRequests)
server.use(express.json())
server.enable('trust proxy')
server.use(helmet())
server.use((req, res, next) => {
    res.setHeader('Content-Security-Policy', "script-src 'self' 'unsafe-inline';")
    // res.setHeader('Content-Security-Policy', "script-src 'unsafe-inline'")
    if (RUN_HTTPS && !req.secure) return res.redirect(`https://${req.headers.host}${req.originalUrl}`)
    next();
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
        .listen(HTTPS_SERVER_PORT, () => console.log(`Secure server started on port ${HTTPS_SERVER_PORT}!`))

function recentPosts() {
    // prisma.post.findMany({take: 10, orderBy: {date: 'desc'}, include: {author: true}}).then((r) => console.log(r))
    return prisma.post.findMany({take: 10, orderBy: {date: 'desc'}, include: {author: true}})
}

server.get('/', async (_, res) => {
    res.render('index', {posts: await recentPosts()})
})

server.get('/featured', async (_, res) => {
    res.render('featured', {data: await recentPosts()})
})

server.get('/about', async (_, res) => {
    res.render('about', {authors: await prisma.user.findMany({where: {author: true}, select: {displayName: true, username: true}})})
})

server.get('/join', (_, res) => {
    res.redirect('/account/register')
})

server.use('/posts', postRouter)
server.use('/users', userRouter)
server.use('/account', accountRouter)

server.use((_, res) => {
    res.status(404).render('../views/404')
})
