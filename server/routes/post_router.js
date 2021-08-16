const express = require('express')
const Post = require('../models/post_model')

const postRouter = express.Router()

postRouter.get('/:slug', async (req, res) => {
    var slug = req.params.slug
    var data = await Post.findOne({slug: slug}).lean()
    if(!data) {
        res.render('404')
        return
    }

    res.render('post', {data: data})
})

postRouter.get('/', (req, res) => {
    res.redirect('/featured')
})

module.exports = postRouter