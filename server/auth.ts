import { NextFunction, Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import { is } from 'typescript-is'

import { env } from './env'
import UserModel from './models/user_model'

interface RegistrationDetails {
    username: string,
    pwd: string,
    displayName: string
}

export function decodeToken(token: string): string {
    return JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString()).id
}

export async function isLoggedIn(token: string, res: Response): Promise<boolean> {
    if (!token) return false
    
    jwt.verify(token, env.JWT_SECRET, (err, decoded) => {
        var msg = {auth: false, message: 'Failed to authenticate token.'};
        if (err) res.status(500).send(msg);
        next();
    })
    if (!(await UserModel.exists({_id: decodeToken(token)}))) {
        if (res != null) {
            res.clearCookie('access_token')
        }
        return false
    }
    return true
}

export async function isAuthor(token: string): Promise<Boolean> {
    let id = decodeToken(token)
    let user = await UserModel.findById(id).lean()

    return user == null ? false : user.author
}

// Middleware for requiring login on a certain page
export async function requireLogin(req: Request, res: Response, next: NextFunction) {
    if (!(await isLoggedIn(req.cookies.access_token, res))) {
        return res.redirect('/account/login')
    }

    next()
}

// Middleware for requiring login on a post request
export async function requireLoginPost(req: Request, res: Response, next: NextFunction) {
    if (!(await isLoggedIn(req.cookies.access_token, res))) {
        return res.json({
            status: 'error',
            error: 'You must be logged in to send this request!',
        })
    }

    next()
}

// Middleware for checking if a user is logged in (for navbar and other site related things)
export async function checkLogin(req: Request, res: Response, next: NextFunction) {
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
export function verifyRegistration(details: RegistrationDetails): boolean {
    if (
        Buffer.from(details.username).includes(' ') ||
        /[~`!#$%\^&*+=\\[\]\\';,/{}|\\':<>\?]/g.test(details.username) ||
        details.pwd.length < 8 ||
        !/\d/.test(details.pwd) ||
        !details.displayName
    ) {
        return false
    }

    return true
}