import express from 'express'
import events from "events"
import dateAssembly from '../date_assembly.js'
import PostModel from '../models/post_model.js'
import UserModel from '../models/user_model.js'

import {requireLoginPost, requireLogin, decodeToken} from '../auth_utils.js'

const postRouter = new express.Router()
const postEmitter = new events.EventEmitter()

postRouter.get('/', (req, res) => {
    res.redirect('../featured')
})

postRouter.get('/create', requireLogin, (req, res) => {
    res.render('create')
})

postRouter.post('/create', requireLoginPost, async (req, res) => {
    console.log('Hello, world!')
    let {title, description, markdown} = req.body
    let id = decodeToken(req.cookies.access_token).id

    let userDetails = await UserModel.findById(id)

    if (!userDetails.author) {
        return res.json({status: 'error', error: 'not permitted'})
    } else {
        try {
            let post = new PostModel({
                title: title,
                description: description,
                markdown: markdown,
                author: userDetails.username
            })
            await post.save()
            postEmitter.emit("post", {title: title, description: description, author: userDetails.username, epochTime: Date.now(), date: dateAssembly()})
        } catch (err) {
            console.log(err.stack)
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

export {postRouter, postEmitter}
