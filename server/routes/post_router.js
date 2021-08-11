const express = require('express');
const Post = require('../models/post_model')

const postRouter = express.Router();

postRouter.get('/:slug', async (req, res) => {
    var slug = req.params.slug;
    var data = await Post.findOne({slug: slug});
    if(!data) res.render('404');
    
    var trimmed = {
        title: data.title,
        description: data.description,
        date: data.date,
        author: data.author,
        slug: data.slug,
        markdown: data.markdown
    };
    res.render('posts', {data: trimmed});
});

module.exports = postRouter;