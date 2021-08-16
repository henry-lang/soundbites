const mongoose = require('mongoose')
// const PasswordValidator = require("password-validator")

// const passwordSchema = new PasswordValidator()
// passwordSchema
// .is.min(8)
// .is.max(20)
// .has().digits(1)
// .has().not().spaces()
// const PasswordValidator = require("password-validator")

const userSchema = new mongoose.Schema({ //for now only username and pwd will be required, but eventually everything here will be needed.
    username: {
        type: String,
        required: true,
        unique: true
    },
    displayName: {
        type: String,
        required: false
    },
    password: {
        type: String,
        required: true
    },
    profilePictureURL: {
        type: String,
        required: false
    },
    author: { // Author for writing posts, other users will be able to write comments, and rate them maybe.
        type: Boolean,
        required: false,
        default: false
    }
})

userSchema.pre('validate', function(next) {
    next()
})

module.exports = mongoose.model('User', userSchema)