import jwt from 'jsonwebtoken'
import UserModel from './models/user_model.js'

const SECRET = process.env.JWT_SECRET

const decodeToken = (token) => {
    if (token == undefined) return undefined
    return JSON.parse(Buffer.from(token.split('.')[1], 'base64')).id
}

const isLoggedIn = async (token, res) => {
    if (!token) return false
    if (jwt.verify(token, SECRET) == false) return false
    if (!(await UserModel.exists({_id: decodeToken(token)}))) {
        if (res != null) {
            res.clearCookie('access_token')
        }
        return false
    }
    return true
}

const isAuthor = async (token) => {
    let id = decodeToken(token)
    let user = await UserModel.findById(id).lean()
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
        return res.json({
            status: 'error',
            error: 'You must be logged in to send this request!',
        })
    }

    next()
}

// Middleware for checking if a user is logged in (for navbar and other site related things)
const checkLogin = async (req, res, next) => {
    let token = req.cookies.access_token

    res.locals.isLoggedIn = await isLoggedIn(token, res)
    if (res.locals.isLoggedIn) {
        res.locals.isAuthor = await isAuthor(token)
    } else {
        res.locals.isAuthor = false
    }

    next()
}

// Verifying that given registration details fulfills our minimum requirements.
const verify = (accountDetails) => {
    let {username, pwd, displayName} = accountDetails
    //this is so scuffed lmao0
    if (
        Buffer.from(username).includes(' ') ||
        /[~`!#$%\^&*+=\-\[\]\\';,/{}|\\':<>\?]/g.test(username) ||
        pwd.length < 8 ||
        !/\d/.test(pwd)
    ) {
        return false
    } else if (!displayName) return false

    return true
}

export {decodeToken, isLoggedIn, isAuthor, requireLogin, requireLoginPost, checkLogin, verify}
