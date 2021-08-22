const logRequest = (req, res, next) => {
    let ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress
    console.log(`Request for ${req.originalUrl} from ${ip}`)

    next()
}

export default logRequest
