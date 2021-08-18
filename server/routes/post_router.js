const express = require('express')

const Post = require('../models/post_model')
const User = require('../models/user_model')

const {requireLoginPost, requireLogin} = require('../auth_utils')

const postRouter = new express.Router()

postRouter.get('/', (req, res) => {
    res.redirect('featured')
})

postRouter.get('/create', requireLogin, (req, res) => {
    res.render('create')
})

postRouter.post('/create', requireLoginPost, async (req, res) => {
    const {title, description, markdown} = req.body
    const decodedToken = JSON.parse(atob(req.cookies.access_token.split('.')[1]))

    const userDetails = await User.findById(decodedToken.id)

    if (!userDetails.author) {
        console.log("author was not true")
        return res.json({status: "error", error: "not permitted"})
    } else {
        post = new Post({
            title: title,
            description: description,
            markdown: markdown,
            author: userDetails.username
        })
        post.save()
    }
    return res.json({status: "OK"})
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