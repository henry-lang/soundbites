const express = require('express')
const Post = require('../models/post_model')

const postRouter = express.Router()

postRouter.get('/', (req, res) => {
    res.redirect('/featured')
})

postRouter.get('/:slug', async (req, res) => {
    var slug = req.params.slug
    var data = await Post.findOne({slug: slug})
    if(!data) {
        res.render('404')
        return
    }

    res.render('post', {data: data})
})

module.exports = postRouter