import express from 'express'
import {requireLoginPost, requireLogin, decodeToken} from '../auth_utils.js'
import {prisma} from '../index.js'
import slugify from 'slugify'
import {marked} from 'marked'
import createDOMPurify from 'dompurify'
import jsdom from 'jsdom'

const dompurify = createDOMPurify(new jsdom.JSDOM('').window)
const postRouter = new express.Router()

postRouter.get('/', (req, res) => {
    res.redirect('../featured')
})

postRouter.get('/create', requireLogin, (req, res) => {
    res.render('create')
})

postRouter.post('/create', requireLoginPost, async (req, res) => {
    let {title, description, markdown} = req.body
    console.log(description.length)
    let id = decodeToken(req.cookies.access_token)

    let userDetails = await prisma.user.findFirst({where: {id}})

    if (!userDetails.author) {
        return res.json({status: 'error', error: 'not permitted'})
    } else if (description.length > 100) {
        return res.json({status: 'error', error: 'please keep description under 100 characters!'})
    } else {
        try {
            let slug = slugify(title, {lower: true, strict: true})
            let html = dompurify.sanitize(marked(markdown))
            await prisma.post.create({
                data: {
                    title,
                    slug,
                    html,
                    description,
                    markdown,
                    authorId: id,
                },
            })
        } catch (err) {
            console.log(err)
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
    let data = await prisma.post.findFirst({
        where: {slug},
        include: {author: true, comments: {take: 10, include: {author: true}}},
    })
    if (!data) {
        res.render('404')
        return
    }

    res.render('post', {data: data, comments: data.comments, author: data.author})
})

postRouter.post('/:slug/comment', requireLoginPost, async (req, res) => {
    try {
        let slug = req.params.slug
        let content = req.body.content
        let authorId = decodeToken(req.cookies.access_token)
        if (content == '') return
        else if (content.length > 280) {
            return res.json({status: 'error', error: 'please keep comments under 280 characters!'})
        }
        let post = await prisma.post.findFirst({where: {slug}, select: {id}})
        await prisma.comment.create({data: {content, postId: post.id, authorId}})

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

export {postRouter}
