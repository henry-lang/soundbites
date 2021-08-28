import PostModel from './models/post_model.js'

const getPosts = async () => {
    let lastWeek = Date.now() - 604800000
    return await PostModel.find({epochTime: {$gt: lastWeek}}).sort({epochTime: -1}).limit(5)
}

export default getPosts
