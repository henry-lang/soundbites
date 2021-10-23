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
    console.log(description.length)
    let id = decodeToken(req.cookies.access_token)

    let userDetails = await UserModel.findById(id)

    if (!userDetails.author) {
        return res.json({status: 'error', error: 'not permitted'})
    } else if (description.length > 100) {
        return res.json({status: 'error', error: 'please keep description under 100 characters!'})
    } else {
        try {
            let post = new PostModel({
                title: title,
                description: description,
                markdown: markdown,
                author: userDetails._id,
                date: dateAssembly(),
            })
            await post.save()
            userDetails.posts.push(post)
            await userDetails.populate()
            await userDetails.save()
            postEmitter.emit('post', {
                title: title,
                description: description,
                author: userDetails._id,
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
            return res.json({status: 'error', error: err.toString()})
        }
    }
    return res.json({status: 'OK'})
})

postRouter.get('/:slug', async (req, res) => {
    let slug = req.params.slug
    let data = await PostModel.findOne({slug: slug})
    let myData = await UserModel.findById(decodeToken(req.cookies.access_token))
    if (!data) {
        res.render('404')
        return
    }
    
    let canDelete = false
    let author = await UserModel.findById(data.author)
    if (myData && myData.username == author.username) {canDelete = true}
    let commentList = []
    await Promise.all(
        data.comments.map(async (commentRef) => {
            let comment = await CommentModel.findById(commentRef)
            let author = await UserModel.findById(comment.author)
            let canDeleteComment = false
            if (myData && myData.username == author.username) {canDeleteComment = true}
            commentList.push({
                content: comment.content,
                date: comment.date,
                authorDisplay: author.displayName,
                authorPerm: author.author,
                author: author.username,
                avatar: author.avatar,
                _id: comment._id,
                canDelete: canDeleteComment,
            })
        })
    )
    res.render('post', {data: data, comments: commentList, author: author, canDelete: canDelete})
})

postRouter.post('/:slug/comment', requireLoginPost, async (req, res) => {
    try {
        let slug = req.params.slug
        let content = req.body.content
        let authorID = decodeToken(req.cookies.access_token)
        if (content == '') return
        else if (content.length > 280) {
            return res.json({status: 'error', error: 'please keep comments under 280 characters!'})
        }
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

postRouter.post('/:slug/comment/delete', requireLoginPost, async (req, res) => {
    try {
        let commentID = req.body.commentID
        let postID = req.body.postID
        let comment = CommentModel.findById(commentID)
        
        if (!comment) {
            return res.json({status: 'error', error: 'this comment does not exist or has been deleted.'})
        }

        let post = await PostModel.findOne({slug: postID})
        post.comments.splice(post.comments.indexOf(commentID))
        await post.save()

        await CommentModel.findOneAndRemove(commentID)
        return res.json({status: "ok"})
    } catch (err) {
        throw err   
    }
})

export {postRouter, postEmitter}
