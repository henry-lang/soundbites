import express from 'express'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import multer from 'multer'

import {requireLogin, requireLoginPost, decodeToken, verifyRegistration} from '../auth'

import UserModel from '../models/user_model.js'
import { env } from '../env'

const accountRouter = express.Router()
const diskStorage = multer.diskStorage({
    destination: (_req, _res, cb) => cb(null, 'assets/avatars/'), 
    filename: (req, _res, cb) => cb(null, decodeToken(req.cookies.access_token))
})

const avatarUpload = multer({storage: diskStorage})

accountRouter.get('/', requireLogin, async (req, res) => {
    let id = decodeToken(req.cookies.access_token)
    let userDetails = await UserModel.findById(id).lean()

    res.render('profile', {data: userDetails})
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
    let id = decodeToken(req.cookies.access_token)
    let user = await UserModel.findById(id)
    if(user == null) {
        res.render('404')
    } else {
        res.render('settings', {
            data: {username: user.username, displayName: user.displayName, bio: user.bio},
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

    try {
        let newUser = new UserModel({
            username: req.body.username,
            password: pwd,
            displayName: displayName,
            avatar: 'assets/default-photo.png',
            author: false,
            admin: false,
        })
        await newUser.save()

        let token = jwt.sign(
            {id: newUser._id, message: 'keep your id a secret!'},
            env.JWT_SECRET
        )
        return res.cookie('access_token', token).json({status: 'ok'})
    } catch (err) {
        if (err.code == '11000') {
            return res.json({status: 'error', error: 'username already taken'})
        }
        res.json({status: 'error', error: err.toString()})
    }
})

accountRouter.post('/login', async (req, res) => {
    let username = req.body.username
    let pwd = req.body.pwd
    let userDetails = await UserModel.findOne({username})

    if (!userDetails) {
        res.json({status: 'error', error: 'invalid login details'})
        return
    }

    if ((await bcrypt.compare(pwd, userDetails.password)) == true) {
        let token = jwt.sign(
            {id: userDetails._id, message: 'keep your token a secret!'},
            env.JWT_SECRET
        )
        return res.cookie('access_token', token).json({status: 'ok'})
    } else res.json({status: 'error', error: 'invalid login details'})
})

accountRouter.post('/settings', requireLoginPost, avatarUpload.single('avatar'), async (req, res) => {
    try {
        let id = decodeToken(req.cookies.access_token)
        let user = await UserModel.findById(id)
        let file = req.file
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
            if (!verifyRegistration({username: user.username, pwd: user.password, displayName: user.displayName})) {
                return res.json({status: "error", error: "username cannot contain special characters. password must be at least 8 characters. display name is required."})
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
    } catch (err) {
        if (err.code == '11000') {
            return res.json({status: 'error', error: 'this username is already taken.'})
        }
        res.json({status: 'error', error: err.toString()})
    }
})
export default accountRouter
