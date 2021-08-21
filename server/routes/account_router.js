const express = require('express')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const {verify} = require('../auth_utils')

const {requireLogin, decodeToken} = require('../auth_utils')

const User = require('../models/user_model')

const accountRouter = new express.Router()

accountRouter.get('/', requireLogin, async (req, res) => {
    var id = decodeToken(req.cookies.access_token).id

    var userDetails = await User.findById(id).lean()
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
    var pwd = await bcrypt.hash(req.body.pwd, 10)
    var username = req.body.username
    var displayName = req.body.displayName

    if (!verify({username: username, pwd: pwd, displayName: displayName})) {
        return res.json({status: 'error', error: 'username cannot contain spaces. password must be at least 8 characters and contain a number. display name is required.'})
    }

    try {
        var newUser = new User({
            username: req.body.username,
            password: pwd,
            displayName: displayName,
            author: false
        })
        await newUser.save()

        var token = jwt.sign({id: newUser._id, message: 'keep your id a secret!'}, process.env.JWT_SECRET)
        return res.cookie('access_token', token).json({status: 'ok'})
    } catch(err) {
        if (err.code == '11000') {
            return res.json({status: 'error', error: 'username already taken'})
        }
        res.json({status: 'error', error: err.toString()})
    }
})

accountRouter.post('/login', async (req, res) => {
    var username = req.body.username
    var pwd = req.body.pwd
    var userDetails = await User.findOne({username})

    if (!userDetails) {
        res.json({status: 'error', error: 'invalid login details'})
        return
    }

    if (await bcrypt.compare(pwd, userDetails.password) == true) {
        var token = jwt.sign({id: userDetails._id, message: 'keep your id a secret!'}, process.env.JWT_SECRET)
        return res.cookie('access_token', token).json({status: 'ok'})
    } else res.json({status: 'error', error: 'invalid login details'})
})

module.exports = accountRouter