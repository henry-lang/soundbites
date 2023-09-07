import {Response} from 'express'

export function apiSuccess(res: Response, data: any) {
    res.status(200)
    res.json({success: true, data})
}

export function apiFailure(res: Response, error: string) {
    res.status(400)
    res.json({success: false, error})
}