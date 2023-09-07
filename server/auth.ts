import { NextFunction, Request, Response } from 'express'
import { apiFailure } from './utils.js'

export async function requireLogin(req: Request, res: Response, next: NextFunction) {
    if (req.session.userId === undefined) {
        return res.redirect('/account/login')
    }

    next()
}

export async function requireLoginPost(req: Request, res: Response, next: NextFunction) {
    if(req.session.userId === undefined) {
        apiFailure(res, 'You must be logged in to perform this action.')
        return
    }

    next()
}
