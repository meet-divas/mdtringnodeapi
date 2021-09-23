const express = require('express')
const auth = require('../middleware/auth')
const UserPost = require('../models/userPost')
const PostComment = require('../models/post_comments')
const User = require('../models/user')
const PostReplyComment = require('../models/post_reply_comment')
require('../db/mongoose') 

const router = new express.Router()


router.post('/api/post_comment',auth,async (req,res) => {
    const postComment = new PostComment({
        ...req.body,
        user:req.user._id
    })

    try{
         const post = await UserPost.findById({_id:postComment.userpost})
         if(post){
             await postComment.save()
             post.comments = post.comments + 1
             await post.save()
         }
         await PostComment.populate(postComment,{path:"user",select:"userName photo code"})
         res.status(201).send(postComment)
    }catch(e){
        res.status(400).send({error:e.message})
    }
})

router.post('/api/post_comment_reply',auth,async (req,res) => {
    const postCommentReply = new PostReplyComment({
        ...req.body,
        user:req.user._id
    })

    try{
        const postComment = await PostComment.findById({_id:postCommentReply.postComment})
        const post = await UserPost.findById({_id:postComment.userpost})
        
        //const toUser = await User.findById({_id:req.body.toUser.toString()})
        //postCommentReply.toUser = toUser._id
         if(post){
            if(postComment.replyComment.length < 5){
                postComment.replyComment = postComment.replyComment.concat(postCommentReply)
                await postComment.save()
            }else{
                await postCommentReply.save()
            }
            post.comments = post.comments + 1
            await post.save()
         }   
         await PostReplyComment.populate(postCommentReply,
            {path:"toUser",select:"userName photo code"})
         await PostReplyComment.populate(postCommentReply,
                {path:"user",select:"userName photo code"})
         res.status(201).send(postCommentReply)
    }catch(e){
        res.status(400).send({error:e.message})
    }
})

router.get('/api/post_comment',auth,async (req,res) => {

    const sort = {}

    if(req.query.sortBy){
        const parts = req.query.sortBy.split(":")
        sort[parts[0]] = parts[1] ==='desc' ? -1 : 1
    }

    try{
         const userList = await PostComment.find({userpost:req.query.id},null,{
            limit:parseInt(req.query.limit),
            skip:parseInt(req.query.skip),
            sort
        }).populate('user','code userName photo')
        .populate('replyComment.toUser','code userName photo')
        .populate('replyComment.user','code userName photo')
         res.status(201).send(userList)
    }catch(e){
        res.status(400).send({error:e.message})
    }
})

router.get('/api/post_comment_reply',auth,async (req,res) => {

    const sort = {}

    if(req.query.sortBy){
        const parts = req.query.sortBy.split(":")
        sort[parts[0]] = parts[1] ==='desc' ? -1 : 1
    }

    try{
         const userList = await PostReplyComment.find({postComment:req.query.id},null,{
            limit:parseInt(req.query.limit),
            skip:parseInt(req.query.skip),
            sort
        }).populate('toUser','code userName photo')
          .populate('user','code userName photo')
         res.status(201).send(userList)
    }catch(e){
        res.status(400).send({error:e.message})
    }
})

router.delete('/api/post_comment',auth,async (req,res) => {


    try{
         const postComment = await PostComment.findById({_id:req.query.id})
         if(postComment){
            if(postComment.user.toString() !== req.user._id.toString()){
                return res.status(401).send({error:"You are not authorised."})
            }           
            const del = await PostReplyComment.deleteMany({postComment:postComment._id})
            const size = postComment.replyComment.length + del.deletedCount
            const post = await UserPost.findById({_id:postComment.userpost})
            post.comments = post.comments - size
            await post.save()
            await postComment.delete() 
         }
         res.status(201).send(true)
    }catch(e){
        res.status(400).send({error:e.message})
    }
})

router.delete('/api/post_comment_reply',auth,async (req,res) => {
    try{
         const postComment = await PostReplyComment.findById({_id:req.query.id})
         if(postComment){
            if(postComment.user !== req.user._id){
                res.status(401).send({error:"You are not authorised."})
            } 
            const post = await UserPost.findById({_id:postComment.userpost})
            post.comments = post.comments - 1
            await post.save()
            await postComment.delete() 
         }
         res.status(201).send(true)
    }catch(e){
        res.status(400).send({error:e.message})
    }
})


module.exports = router