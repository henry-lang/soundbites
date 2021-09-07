import mongoose from 'mongoose'
import assemble from '../date_assembly.js'

const commentSchema = new mongoose.Schema({
    _id: {
        type: mongoose.Schema.Types.ObjectId,
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    content: {
        type: String,
        required: true,
    },
    date: {
        type: String,
        required: true,
    },
    epochTime: {
        type: String,
        required: true,
        unique: true,
    },
})

commentSchema.pre('validate', function (next) {
    this.date = assemble()
    this.epochTime = Date.now()
    next()
})

const CommentModel = mongoose.model('Comment', commentSchema)

export default CommentModel
