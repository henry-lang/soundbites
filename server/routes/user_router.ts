import express from 'express'

import UserModel from '../models/user_model.js'
import PostModel, { Post } from '../models/post_model.js'
import { LeanDocument } from 'mongoose'

const userRouter = express.Router()
userRouter.get('/:username', async (req, res) => {
    let username = req.params.username
    let data = await UserModel.findOne({username: username})
    if (!data) {
        res.render('404')
        return
    }

    const posts: LeanDocument<Post>[] = []
    let trimmed = {
        username: data.username,
        displayName: data.displayName,
        author: data.author,
        bio: data.bio,
        avatar: data.avatar,
        posts
    }
    await Promise.all(
        data.posts.map(async (post) => {
            let p = await PostModel.findById(post._id).lean()
            if(p != null) {
                trimmed.posts.push(p)
            }
        })
    )
    trimmed.posts.sort((a, b) => {
        return b.time - a.time
    })
    res.render('user', {data: trimmed})
})

export default userRouter
