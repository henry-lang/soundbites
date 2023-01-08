import {Schema, model, Types} from 'mongoose'
import assemble from '../date_assembly.js'

interface Comment {
    author: Types.ObjectId,
    content: string,
    date: string,
    epochTime: string
}

const commentSchema = new Schema<Comment>({
    // _id: {
    //     type: Schema.Types.ObjectId,
    // },
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
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
    this.epochTime = Date.now().toString()
    next()
})

const CommentModel = model<Comment>('Comment', commentSchema)

export default CommentModel
