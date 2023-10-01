import express from 'express'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import multer from 'multer'

import {verify, requireLogin, requireLoginPost, decodeToken} from '../auth_utils.js'
import {prisma} from '../index.js'

const accountRouter = new express.Router()
const diskStorage = multer.diskStorage({
    destination: function (req, res, cb) {
        cb(null, 'assets/avatars/')
    },
    filename: function (req, res, cb) {
        console.log(decodeToken(req.cookies.access_token))
        cb(null, `${decodeToken(req.cookies.access_token)}`)
    },
})

const avatarUpload = multer({storage: diskStorage})

accountRouter.get('/', requireLogin, async (req, res) => {
    let id = decodeToken(req.cookies.access_token)
    let userDetails = await prisma.user.findFirst({where: {id}})

    res.render('profile', {data: userDetails})
})

accountRouter.get('/register', (req, res) => {
    res.render('register')
})

accountRouter.get('/login', async (req, res) => {
    res.render('login')
})

accountRouter.get('/logout', async (req, res) => {
    res.clearCookie('access_token').redirect('/')
})

accountRouter.get('/settings', requireLogin, async (req, res) => {
    let id = decodeToken(req.cookies.access_token)
    let user = await prisma.user.findFirst({where: {id}})
    res.render('settings', {
        data: {username: user.username, displayName: user.displayName, bio: user.bio},
    })
})

accountRouter.post('/register', async (req, res) => {
    let pwd = await bcrypt.hash(req.body.pwd, 10)
    let username = req.body.username
    let displayName = req.body.displayName

    if (
        !verify({
            username: username,
            pwd: req.body.pwd,
            displayName: displayName,
        })
    ) {
        return res.json({
            status: 'error',
            error: 'username cannot contain special characters. password must be at least 8 characters and contain a number. display name is required.',
        })
    } else if (await prisma.user.findFirst({where: {username}})) return res.json({status: 'error', error: 'that username is already in use!'})
    try {
        let newUser = await prisma.user.create({
            data: {
                username: req.body.username,
                password: pwd,
                displayName: displayName,
                avatar: 'assets/default-photo.png',
                author: false,
                admin: false,
            },
        })

        let token = jwt.sign(
            {id: newUser.id, message: 'keep your id a secret!'},
            process.env.JWT_SECRET
        )
        return res.cookie('access_token', token).json({status: 'ok'})
    } catch (err) {
        res.json({status: 'error', error: err.toString()})
    }
})

accountRouter.post('/login', async (req, res) => {
    let username = req.body.username
    let pwd = req.body.pwd
    let userDetails = await prisma.user.findFirst({where: {username}})

    if (!userDetails) {
        res.json({status: 'error', error: 'invalid login details'})
        return
    }

    if ((await bcrypt.compare(pwd, userDetails.password)) == true) {
        let token = jwt.sign(
            {id: userDetails.id, message: 'keep your token a secret!'},
            process.env.JWT_SECRET
        )
        return res.cookie('access_token', token).json({status: 'ok'})
    } else res.json({status: 'error', error: 'invalid login details'})
})

accountRouter.post(
    '/settings',
    requireLoginPost,
    avatarUpload.single('avatar'),
    async (req, res) => {
        try {
            let id = decodeToken(req.cookies.access_token)
            let user = await prisma.user.findFirst({where: {id}})
            console.log(user)
            let file = req.file
            var strData = JSON.parse(req.body.strData)

            if (strData.checkbox) {
                console.log(strData)
                for (let i in strData) {
                    if (strData[i] != '') {
                        //if any settings were not changed (they did not fill in the input), then they are ignored.
                        user[i] = strData[i]
                    }
                }

                if (
                    !verify({
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

                delete user.id; delete user.checkbox
                await prisma.user.update({where: {id}, data: user})
                return res.json({status: 'ok', modified: true})
            } else return res.json({status: 'ok', modified: false})
        } catch (err) {
            if (err.code == '11000') {
                return res.json({status: 'error', error: 'this username is already taken.'})
            }
            res.json({status: 'error', error: err.toString()})
        }
    }
)
export default accountRouter
