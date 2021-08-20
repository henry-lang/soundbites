const Post = require('./models/post_model')

const get_posts = async () => {
    const lastWeek = Date.now() - 604800000
    var q = await Post.find({ 'epochTime': {$gt: lastWeek}})
    return q
}

module.exports = get_posts