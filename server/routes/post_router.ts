import express from 'express'
import events from 'events'
import mongoose, { MongooseError } from 'mongoose'
import dateAssembly from '../date_assembly.js'
import PostModel from '../models/post_model.js'
import UserModel from '../models/user_model.js'
import CommentModel from '../models/comment_model.js'

import {requireLoginPost, requireLogin, decodeToken} from '../auth.js'
import { is } from 'typescript-is'

interface CreatePostDetails {
    title: string,
    description: string,
    markdown: string
}

const postRouter = express.Router()
const postEmitter = new events.EventEmitter()

postRouter.get('/', (_req, res) => {
    res.redirect('../featured')
})

postRouter.get('/create', requireLogin, (_req, res) => {
    res.render('create')
})

postRouter.post('/create', requireLoginPost, async (req, res) => {
    const id = decodeToken(req.cookies.access_token)
    if(!is<CreatePostDetails>(req.body)){
        return res.json({status: 'error', error: 'malformed request data'})
    } 

    const {title, description, markdown} = req.body

    let userDetails = await UserModel.findById(id)
    if(userDetails == null) return res.json({status: 'error', error: 'user does not exist'})

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
            await userDetails.save()
            postEmitter.emit('post', {
                title: title,
                description: description,
                author: userDetails._id,
                epochTime: Date.now(),
                date: dateAssembly(),
                slug: post.slug,
            })
        } catch (err: any) {
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
    // let myData = await UserModel.findById(decodeToken(req.cookies.access_token))
    if (!data) {
        res.render('404')
        return
    }
    
    let author = await UserModel.findById(data.author)
    let commentList = []
    await Promise.all(
        data.comments.map(async (commentRef) => {
            let comment = await CommentModel.findById(commentRef)
            let author = await UserModel.findById(comment.author)
            commentList.push({
                content: comment.content,
                date: comment.date,
                authorDisplay: author.displayName,
                authorPerm: author.author,
                author: author.username,
                avatar: author.avatar,
                _id: comment._id,
            })
        })
    )
    res.render('post', {data: data, comments: commentList, author: author})
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

// postRouter.post('/:slug/comment/delete', requireLoginPost, async (req, res) => {
//     try {
//         let commentID = req.body.commentID
//         let postID = req.body.postID
//         let comment = CommentModel.findById(commentID)
        
//         if (!comment) {
//             return res.json({status: 'error', error: 'this comment does not exist or has been deleted.'})
//         }

//         let post = await PostModel.findOne({slug: postID})
//         post.comments.splice(post.comments.indexOf(commentID), 1)
//         await post.save()

//         await CommentModel.findOneAndRemove(commentID)
//         return res.json({status: "ok"})
//     } catch (err) {
//         throw err   
//     }
// })

export {postRouter, postEmitter}
