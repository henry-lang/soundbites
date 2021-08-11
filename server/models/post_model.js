const mongoose = require('mongoose');
const slugify = require('slugify');

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
    }
});

postSchema.pre('validate', function(next) {
    console.log('pog');
    this.slug = slugify(this.title, {lower: true, strict: true});

    next();
});

module.exports = mongoose.model('Post', postSchema);