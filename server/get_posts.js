import PostModel from './models/post_model.js'

const getPosts = async () => {
    let lastWeek = Date.now() - 604800000
    let q = await PostModel.find({epochTime: {$gt: lastWeek}})
    return q
}

export default getPosts
