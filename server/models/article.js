const mongoose = require('mongoose');

const articleSchema = new mongoose.Schema({
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
    }
});

module.exports = mongoose.model('Article', articleSchema);