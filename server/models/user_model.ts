import {Schema, model, Types} from 'mongoose'

interface User {
    username: string,
    displayName: string,
    password: string,
    avatar: string,
    author: boolean,
    admin: boolean,
    bio?: string,
    posts: Types.ObjectId[]
}

const userSchema = new Schema<User>({
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
    avatar: {
        type: String,
        required: false,
    },
    author: {
        // Author for writing posts, other users will be able to write comments, and rate them maybe.
        type: Boolean,
        required: false,
        default: false,
    },
    admin: {
        type: Boolean,
        required: false,
        default: false
    },
    bio: {
        type: String,
        required: false,
    },
    posts: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Post',
        },
    ],
})

userSchema.pre('validate', function (next) {
    next()
})

const UserModel = model<User>('User', userSchema)

export default UserModel
