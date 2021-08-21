import express from 'express'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'

import {verify, requireLogin, decodeToken} from '../auth_utils.js'

import UserModel from '../models/user_model.js'

const accountRouter = new express.Router()

accountRouter.get('/', requireLogin, async (req, res) => {
    let id = decodeToken(req.cookies.access_token).id
    let userDetails = await UserModel.findById(id).lean()

    res.render('profile', {username: userDetails.username, displayName: userDetails.displayName, author: userDetails.author})
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

accountRouter.post('/register', async (req, res) => {
    let pwd = await bcrypt.hash(req.body.pwd, 10)
    let username = req.body.username
    let displayName = req.body.displayName

    if (!verify({username: username, pwd: pwd, displayName: displayName})) {
        return res.json({status: 'error', error: 'username cannot contain spaces. password must be at least 8 characters and contain a number. display name is required.'})
    }

    try {
        let newUser = new UserModel({
            username: req.body.username,
            password: pwd,
            displayName: displayName,
            author: false
        })
        await newUser.save()

        let token = jwt.sign({id: newUser._id, message: 'keep your id a secret!'}, process.env.JWT_SECRET)
        return res.cookie('access_token', token).json({status: 'ok'})
    } catch(err) {
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

    if (await bcrypt.compare(pwd, userDetails.password) == true) {
        let token = jwt.sign({id: userDetails._id, message: 'keep your token a secret!'}, process.env.JWT_SECRET)
        return res.cookie('access_token', token).json({status: 'ok'})
    } else res.json({status: 'error', error: 'invalid login details'})
})

export default accountRouter