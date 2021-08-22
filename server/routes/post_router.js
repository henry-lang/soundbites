import express from 'express'

import PostModel from '../models/post_model.js'
import UserModel from '../models/user_model.js'

import {requireLoginPost, requireLogin, decodeToken} from '../auth_utils.js'

const postRouter = new express.Router()

postRouter.get('/', (req, res) => {
    res.redirect('../featured')
})

postRouter.get('/create', requireLogin, (req, res) => {
    res.render('create')
})

postRouter.post('/create', requireLoginPost, async (req, res) => {
    let {title, description, markdown} = req.body
    let id = decodeToken(req.cookies.access_token).id

    let userDetails = await UserModel.findById(id)

    if (!userDetails.author) {
        return res.json({status: 'error', error: 'not permitted'})
    } else {
        try {
            post = new PostModel({
                title: title,
                description: description,
                markdown: markdown,
                author: userDetails.username,
            })
            await post.save()
        } catch (err) {
            if (err.code == '11000') {
                return res.json({
                    status: 'error',
                    error: 'title already exists',
                })
            }
        }
    }
    return res.json({status: 'OK'})
})

postRouter.get('/:slug', async (req, res) => {
    let slug = req.params.slug
    let data = await PostModel.findOne({slug: slug})
    if (!data) {
        res.render('404')
        return
    }

    res.render('post', {data: data})
})

export default postRouter
