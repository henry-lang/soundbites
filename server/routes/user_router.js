import express from 'express'

import {prisma} from '../index.js'

const userRouter = new express.Router()
userRouter.get('/:username', async (req, res) => {
    let username = req.params.username
    let data = await prisma.user.findFirst({where: {username}, include: {posts: {take: 10}}})
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
    }

    let posts = data.posts
    posts.map((p) => {
        p.author = trimmed
    })
    res.render('user', {data: trimmed, posts: data.posts})
})

export default userRouter
