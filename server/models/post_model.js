import mongoose from 'mongoose'
import slugify from 'slugify'
import marked from 'marked'

import createDOMPurify from 'dompurify'
import jsdom from 'jsdom'

import dateAssembly from '../date_assembly.js'

const dompurify = createDOMPurify(new jsdom.JSDOM('').window)

const postSchema = new mongoose.Schema({
    slug: {
        type: String,
        unique: true,
        required: true
    },
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true,
    },
    date: {
        type: String,
        required: true,
    },
    author: {
        type: String,
        required: true
    },
    markdown: {
        type: String,
        required: true
    },
    html: {
        type: String,
        required: true
    },

    epochTime: {
        type: Number,
        required: true
    }
})

postSchema.pre('validate', function(next) {
    this.date = dateAssembly()
    this.slug = slugify(this.title, {lower: true, strict: true})
    this.html = dompurify.sanitize(marked(this.markdown))
    this.epochTime = Date.now()

    next()
})

const PostModel = mongoose.model('Post', postSchema)

export default PostModel