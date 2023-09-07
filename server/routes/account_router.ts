import express from 'express'
import bcrypt from 'bcryptjs'
import multer from 'multer'

import {requireLogin, requireLoginPost} from '../auth.js'
import {prisma} from '../prisma.js'
import {validateRequestBodyAsync} from 'zod-express'
import {z} from 'zod'
import { apiFailure } from '../utils.js'

const accountRouter = express.Router()
const diskStorage = multer.diskStorage({
    destination: (_req, _res, cb) => cb(null, 'assets/avatars/'),
    filename: (req, _res, cb) =>
        cb(null, decodeToken(req.session)),
})

const avatarUpload = multer({storage: diskStorage})

accountRouter.get('/', requireLogin, async (req, res) => {
    const user = await prisma.user.findFirst({
        where: {id: req.session.userId},
    })

    res.render('profile', {data: user})
})

accountRouter.get('/register', (_req, res) => {
    res.render('register')
})

accountRouter.get('/login', (_req, res) => {
    res.render('login')
})

accountRouter.get('/logout', (_req, res) => {
    res.clearCookie('access_token').redirect('/')
})

accountRouter.get('/settings', requireLogin, async (req, res) => {
    let user = await prisma.user.findFirst({where: {id: req.session.userId}})
    if (user == null) {
        res.render('404')
    } else {
        res.render('settings', {
            data: {username: user.username, bio: user.bio},
        })
    }
})

accountRouter.post('/register', async (req, res) => {
    let pwd = await bcrypt.hash(req.body.pwd, 10)
    if (
        !verifyRegistration({
            username: req.body.username,
            pwd: req.body.pwd,
            displayName: req.body.displayName,
        })
    ) {
        return res.json({
            status: 'error',
            error: 'username cannot contain special characters. password must be at least 8 characters and contain a number. display name is required.',
        })
    }
})

accountRouter.post(
    '/login',
    validateRequestBodyAsync(
        z.object({username: z.string(), password: z.string()})
    ),
    async (req, res) => {
        const userDetails = await prisma.user.findFirst({where: {username: req.body.username}})

        if (!userDetails) {
            apiFailure(res, 'invalid login details')
            return
        }

        const passwordCorrect = await bcrypt.compare(req.body.password, userDetails.password)

        if (passwordCorrect) {
            req.session.userId = userDetails.id
        } else {
            apiFailure(res, 'invalid login details')
        }
    }
)

accountRouter.post(
    '/settings',
    requireLoginPost,
    avatarUpload.single('avatar'),
    async (req, res) => {
        const user = await prisma.user.findFirst({where: {id: req.session.userId}})

        if(!user) {
            apiFailure(res, 'error')
            return
        }

        const file = req.file
        var strData = JSON.parse(req.body.strData)
        let oldUsername = user.username

        if (strData.checkbox) {
            for (let i in strData) {
                if (strData[i] != '') {
                    //if any settings were not changed (they did not fill in the input), then they are ignored.
                    user[i] = strData[i]
                }
            }

            console.log(user)
            if (
                !verifyRegistration({
                    username: user.username,
                    pwd: user.password,
                    displayName: user.displayName,
                })
            ) {
                return res.json({
                    status: 'error',
                    error: 'username cannot contain special characters. password must be at least 8 characters. display name is required.',
                })
            }

            if (file) {
                if (file.mimetype.split('/')[0] == 'image') {
                    user.avatar = `assets/avatars/${id}`
                } else
                    return res.json({
                        status: 'error',
                        error: 'filetype must be an image (jpg, png, gif)',
                    })
            }

            await user.save()
            return res.json({status: 'ok', modified: true})
        } else return res.json({status: 'ok', modified: false})
    }
)
export default accountRouter
