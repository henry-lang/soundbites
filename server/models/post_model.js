const mongoose = require('mongoose');
const slugify = require('slugify');
const marked = require('marked');

const createDOMPurify = require('dompurify');
const jsdom = require('jsdom');

const dompurify = createDOMPurify(new jsdom.JSDOM('').window);

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
        required: false,
    },
    date: {
        type: Date,
        default: Date.now
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
});

postSchema.pre('validate', function(next) {
    this.slug = slugify(this.title, {lower: true, strict: true});
    this.html = dompurify.sanitize(marked(this.markdown));

    next();
});

module.exports = mongoose.model('Post', postSchema);