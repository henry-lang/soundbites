import PostModel from './models/post_model'
import UserModel from './models/user_model'

const getPosts = async () => {
    let lastWeek = Date.now() - 604800000
    let posts = await PostModel.find({epochTime: {$gt: lastWeek}})
        .sort({epochTime: -1})
        .limit(5)

    let cloned = JSON.parse(JSON.stringify(posts))

    await Promise.all(await posts.map(async (post) => {
        post.author = await UserModel.findById(post.author)
    }))


    return posts
}

export default getPosts
