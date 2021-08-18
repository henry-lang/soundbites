const mongoose = require('mongoose')
const slugify = require('slugify')
const marked = require('marked')

const createDOMPurify = require('dompurify')
const jsdom = require('jsdom')

const dateAssembly = require('../date_assembly')

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
    }
})

postSchema.pre('validate', function(next) {
    this.date = dateAssembly()
    this.slug = slugify(this.title, {lower: true, strict: true})
    this.html = dompurify.sanitize(marked(this.markdown))

    next()
})

module.exports = mongoose.model('Post', postSchema)