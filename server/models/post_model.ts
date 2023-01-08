import { Schema, Types, model } from 'mongoose'
import slugify from 'slugify'
import {marked} from 'marked'

import createDOMPurify from 'dompurify'
import jsdom from 'jsdom'

const dompurify = createDOMPurify(new jsdom.JSDOM('').window as any) // Evil but I can't figure it out

interface Post {
    author: Types.ObjectId
    slug: string,
    title: string,
    description: string,
    date: string,
    markdown: string,
    html: string,
    time: number,
    comments: Types.ObjectId[]
}

const postSchema = new Schema<Post>({
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    slug: {
        type: String,
        unique: true,
        required: true,
    },
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    date: {
        type: String,
        required: true,
    },
    markdown: {
        type: String,
        required: true,
    },
    html: {
        type: String,
        required: true,
    },
    time: {
        type: Number,
        required: true,
    },
    comments: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Comment',
        },
    ],
})

postSchema.pre('validate', function (next) {
    // this.date = dateAssembly()
    this.slug = slugify(this.title, {lower: true, strict: true})
    this.html = dompurify.sanitize(marked(this.markdown))
    this.time = Date.now()

    next()
})

const PostModel = model<Post>('Post', postSchema)

export default PostModel
