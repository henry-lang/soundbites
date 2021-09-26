import express from 'express'

import UserModel from '../models/user_model.js'
import PostModel from '../models/post_model.js'

const userRouter = new express.Router()
userRouter.get('/:username', async (req, res) => {
    console.log("called")
    let username = req.params.username
    let data = await UserModel.findOne({username: username})
    if (!data) {
        res.render('404')
        return
    }

    let trimmed = {
        username: data.username,
        displayName: data.displayName,
        author: data.author,
        bio: data.bio,
        avatar: data.avatar,
        posts: []
    }
    console.log("data", data.posts)
    await Promise.all(
        data.posts.map(async (post) => {
        let p = await PostModel.findById(post._id)
        p.author = await UserModel.findById(post.author)
        trimmed.posts.push(p)
        console.log("finished")
    }))
    console.log(trimmed.posts)
    res.render('user', {data: trimmed})
})

export default userRouter
