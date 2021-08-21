const jwt = require('jsonwebtoken')
const Users = require('./models/user_model')

const SECRET = process.env.JWT_SECRET

const decodeToken = token => {
    return JSON.parse(Buffer.from(token.split('.')[1], 'base64'))
}

const isLoggedIn = async (token, res) => {
    if(!token) return false
    if(jwt.verify(token, SECRET) == false) return false
    if(!(await Users.exists({_id: decodeToken(token).id}))) {
        if(res != null) {
            res.clearCookie('access_token')
        }
        return false
    }
    return true
}

const isAuthor = async token => {
    const id = decodeToken(token).id
    const user = await Users.findById(id).lean()
    return user.author
}

// Middleware for requiring login on a certain page
const requireLogin = async (req, res, next) => {
    if (!(await isLoggedIn(req.cookies.access_token))) {
        return res.redirect('/account/login')
    }

    next()
}

// Middleware for requiring login on a post request
const requireLoginPost = async (req, res, next) => {
    if (!(await isLoggedIn(req.cookies.access_token))) {
        return res.json({status: 'error', error: 'You must be logged in to send this request!'})
    }

    next()
}

// Middleware for checking if a user is logged in (for navbar and other site related things)
const checkLogin = async (req, res, next) => {
    const token = req.cookies.access_token

    res.locals.isLoggedIn = await isLoggedIn(token, res)
    if(res.locals.isLoggedIn) {
        res.locals.isAuthor = await isAuthor(token)
    } else {
        res.locals.isAuthor = false
    }
    
    next()
}

// Verifying that given registration details fulfills our minimum requirements.
const verify = (accountDetails) => {
    const {username, pwd, displayName} = accountDetails
    if (Buffer.from(username).includes(' ') || /[~`!#$%\^&*+=\-\[\]\\';,/{}|\\':<>\?]/g.test(username) || pwd < 8 || !/\d/.test(pwd)) { //this is so scuffed lmao
        return false
    }

    else if (!displayName) return false

    return true
}

module.exports = 
{
    decodeToken,
    isLoggedIn,
    isAuthor,
    requireLogin,
    requireLoginPost,
    checkLogin,
    verify
}