const jwt = require('jsonwebtoken')

const SECRET = process.env.JWT_SECRET

const isLoggedIn = token => {
    if(!token || jwt.verify(token, SECRET) == false) {
        return false
    }
    return true
}

// Middleware for requiring login on a certain page
const requireLogin = (req, res, next) => {
    if (!isLoggedIn(req.cookies.access_token)) {
        return res.redirect("/account/login")
    }

    next()
}

// Middleware for requiring login on a post request
const requireLoginPost = (req, res, next) => {
    if (!isLoggedIn(req.cookies.access_token)) {
        return res.json({status: 'You must be logged in to send this request!'})
    }

    next()
}

// Middleware for checking if a user is logged in (for navbar and other site related things)
const checkLogin = (req, res, next) => {
    res.locals.isLoggedIn = isLoggedIn(req.cookies.access_token)
    
    next()
}

module.exports = 
{
    isLoggedIn: isLoggedIn,
    requireLogin: requireLogin,
    requireLoginPost: requireLoginPost,
    checkLogin: checkLogin
}