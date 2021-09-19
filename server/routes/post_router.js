import express from 'express'
import events from 'events'
import mongoose from 'mongoose'
import dateAssembly from '../date_assembly.js'
import PostModel from '../models/post_model.js'
import UserModel from '../models/user_model.js'
import CommentModel from '../models/comment_model.js'

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
                author: userDetails.username,
            })
            await post.save()
            postEmitter.emit('post', {
                title: title,
                description: description,
                author: userDetails.username,
                epochTime: Date.now(),
                date: dateAssembly(),
                slug: post.slug,
            })
        } catch (err) {
            if (err.code == '11000') {
                return res.json({
                    status: 'error',
                    error: 'title already exists',
                })
            }
            res.json({status: 'error', error: err.toString()})
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

    let commentList = []
    await Promise.all(
        data.comments.map(async (commentRef) => {
            let comment = await CommentModel.findById(commentRef)
            console.log(comment.content)
            let author = await UserModel.findById(comment.author)
            commentList.push({
                content: comment.content,
                date: comment.date,
                authorDisplay: author.displayName,
                author: author.username,
            })
        })
    )
    res.render('post', {data: data, comments: commentList})
})

postRouter.post('/:slug/comment', requireLoginPost, async (req, res) => {
    try {
        let slug = req.params.slug
        let content = req.body.content
        let authorID = decodeToken(req.cookies.access_token).id
        if (content == '') return
        let comment = new CommentModel({
            _id: new mongoose.Types.ObjectId(),
            author: authorID,
            content: content,
        })
        await comment.save()
        let post = await PostModel.findOne({slug: slug})
        post.comments.push(comment._id)
        await post.save()
        await post.populate('comments')

        res.json({status: 'ok'})
    } catch (err) {
        res.json({status: 'error', error: err.toString()})
    }
})

export {postRouter, postEmitter}
