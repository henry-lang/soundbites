import express from 'express'

import UserModel from '../models/user_model.js'

const userRouter = new express.Router()
userRouter.get('/:username', async (req, res) => {
    let username = req.params.username
    let data = await UserModel.findOne({username: username})
    if (!data) {
        res.render('404')
        return
    }

    let trimmed = {
        username: data.username,
        displayName: data.displayName,
    }
    res.render('user', {data: trimmed})
})

export default userRouter
