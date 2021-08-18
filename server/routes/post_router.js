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
    const decodedToken = JSON.parse(Buffer.from(req.cookies.access_token.split('.')[1], "base64").toString("ascii"))

    const userDetails = await User.findById(decodedToken.id)

    if (!userDetails.author) {
        return res.json({status: "error", error: "not permitted"})
    } else {
        try {
            post = new Post({
                title: title,
                description: description,
                markdown: markdown,
                author: userDetails.username
            })
            await post.save()
        } catch (err) {
            if (err.code == "11000") {return res.json({status: "error", error: "title already exists"})}
        }
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