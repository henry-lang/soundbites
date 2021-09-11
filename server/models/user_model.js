import mongoose from 'mongoose'

const userSchema = new mongoose.Schema({
    //for now only username and pwd will be required, but eventually everything here will be needed.
    username: {
        type: String,
        required: true,
        unique: true,
    },
    displayName: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    profilePictureURL: {
        type: String,
        required: false,
    },
    author: {
        // Author for writing posts, other users will be able to write comments, and rate them maybe.
        type: Boolean,
        required: false,
        default: false,
    },
    bio: {
        type: String,
        required: false,
        default: "This user has no bio."
    }
})

userSchema.pre('validate', function (next) {
    next()
})

const UserModel = mongoose.model('User', userSchema)

export default UserModel
