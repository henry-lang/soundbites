const logRequest = (req, res, next) => {
    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress
    console.log(`Request for ${req.originalUrl} from ${ip}`)
    next()
}

module.exports = logRequest