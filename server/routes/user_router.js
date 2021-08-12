const express = require('express');
const user = require("../models/user_model")

const userRouter = new express.Router();
userRouter.get('/:username', async (req, res) => {
    var username = req.params.username;
    var data = await user.findOne({username: username});
    if(!data) {
        res.render('404');
        return;
    }
    
    var trimmed = {
        username: data.username,
        displayName: data.displayName
    };
    res.render('user', {data: trimmed});
});

module.exports = userRouter;