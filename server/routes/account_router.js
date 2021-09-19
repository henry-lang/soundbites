import express from 'express'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import multer from 'multer'
import fs from 'fs'

import {verify, requireLogin, requireLoginPost, decodeToken} from '../auth_utils.js'

import UserModel from '../models/user_model.js'

const accountRouter = new express.Router()
const upload = multer({ dest: 'uploads/' })

accountRouter.get('/', requireLogin, async (req, res) => {
    let id = decodeToken(req.cookies.access_token).id
    let userDetails = await UserModel.findById(id).lean()

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
    let id = decodeToken(req.cookies.access_token).id
    let user = await UserModel.findById(id)
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
            error: 'username cannot contain spaces. password must be at least 8 characters and contain a number. display name is required.',
        })
    }

    try {
        let newUser = new UserModel({
            username: req.body.username,
            password: pwd,
            displayName: displayName,
            avatar: {
                imgData: fs.readFileSync("assets/default-photo.png"),
                imgType: "image/png"
            },
            author: false,
        })
        await newUser.save()

        let token = jwt.sign(
            {id: newUser._id, message: 'keep your id a secret!'},
            process.env.JWT_SECRET
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
            process.env.JWT_SECRET
        )
        return res.cookie('access_token', token).json({status: 'ok'})
    } else res.json({status: 'error', error: 'invalid login details'})
})

accountRouter.post('/settings', requireLoginPost, upload.single('avatar'), async (req, res) => {
    try {
        let id = decodeToken(req.cookies.access_token).id
        let user = await UserModel.findById(id)
        let file = req.file
        var strData = JSON.parse(req.body.strData)

        if (strData.checkbox) {
            for (let i in strData) {
                if (strData[i] != '') {
                    //if any settings were not changed (they did not fill in the input), then they are ignored.
                    user[i] = strData[i]
                }
            }

            if (file != undefined) {
                if (file.mimetype.split("/")[0] == "image") {
                    user.avatar = {
                        imgData: fs.readFileSync(`uploads/${file.filename}`),
                        imgType: file.mimetype                    
                    }
                } else return res.json({status: "error", error: "filetype must be an image (jpg, png, gif)"})
            }

            await user.save()
            return res.json({status: 'ok', modified: true})
        } else {
            return res.json({status: 'ok', modified: false})
        }
    } catch (err) {
        if (err.code == '11000') {
            return res.json({status: 'error', error: 'this username is already taken.'})
        }
        res.json({status: 'error', error: err.toString()})
    }
})
export default accountRouter
