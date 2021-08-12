const mongoose = require('mongoose');
// const PasswordValidator = require("password-validator")

// const passwordSchema = new PasswordValidator();
// passwordSchema
// .is.min(8)
// .is.max(20)
// .has().digits(1)
// .has().not().spaces()
// const PasswordValidator = require("password-validator")

// const passwordSchema = new PasswordValidator();
// passwordSchema
// .is.min(8)
// .is.max(20)
// .has().digits(1)
// .has().not().spaces()

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    displayName: {
        type: String,
        required: true
    },
    password: {
        type: String,
    },
    profilePictureURL: {
        type: String,
        required: false
    },
    author: { // Author for writing posts, other users will be able to write comments, and rate them maybe.
        type: Boolean,
        required: true,
        default: false
    }
});

userSchema.pre('validate', function(next) {
    next();
});

module.exports = mongoose.model('User', userSchema);