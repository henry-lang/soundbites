import { NextFunction, Request, Response } from 'express'

const logRequest = (req: Request, _: Response, next: NextFunction) => {
    let ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress
    console.log(`Request for ${req.originalUrl} from ${ip}`)

    next()
}

export default logRequest
