const express = require('express')
const auth = require('../middleware/auth')
const UserPost = require('../models/userPost')
const UserStory = require('../models/userStory')
const PostLike = require('../models/postLike')
require('../db/mongoose') 

const router = new express.Router()

router.post('/api/v1/post',auth,async (req,res) => {
    const post = new UserPost({
        ...req.body,
        user:req.user._id,
        userName:req.user.userName,
        userCode:req.user.code,
        userPhoto:req.user.photo
    })

    try{
         await post.save()
         res.status(201).send(post)
    }catch(e){
        res.status(400).send({error:e.message})
    }
})

router.post('/api/post',auth,async (req,res) => {
    const post = new UserPost({
        ...req.body,
        user:req.user._id,
        userName:req.user.userName,
        userCode:req.user.userCode,
        userPhoto:req.user.photo
    })

    if(req.body.feeling){
        post.feelingName = req.body.feeling.name.toString()
        post.feelingDesc = req.body.feeling.desc.toString()
        post.feelingIcon = parseInt(req.body.feeling.icon.toString())
        post.feelingType = parseInt(req.body.feeling.type.toString())
    }

    try{
         await post.save()
         res.status(201).send(post)
    }catch(e){
        res.status(400).send({error:e.message})
    }
})

router.get('/api/v1/post',auth, async (req,res) => {

    const sort = {}
    const match = {
        status:1
    }
    let skip = parseInt(req.query.skip)
    if(req.query.sortBy){
        const parts = req.query.sortBy.split(":")
        sort[parts[0]] = parts[1] ==='desc' ? -1 : 1
    }

    if(req.query.syncDate){
        const date = new Date(req.query.syncDate)
        console.log(date)
        if(req.query.type.toString() === 'append'){
            match.updatedAt={$lt:date}
        }else{
            match.updatedAt={$gt:date}
        }
        skip = 0
    }

    try{
         const size = await UserPost.countDocuments({status:1})

         const itemList = await UserPost.aggregate([
            {
              $match:match
            },
            {
                $sort:sort
            },{
                $skip:skip 
            },{
                $limit:parseInt(req.query.limit)
            },{
                $lookup:{
                    from:"postlikes",
                    let:{userId:req.user._id,postId:"$_id"},
                    pipeline:[
                        {
                            $match:{
                                $expr:{
                                    $and:[
                                        {
                                            $eq:["$user","$$userId"]
                                            
                                        },{
                                            $eq:["$userpost","$$postId"]
                                        }
                                    ]
                                }
                            }
                        },
                        { $project: { user:0,userpost:0,createdAt:0,updatedAt:0,_id: 0,__v:0 } }
                    ],
                    as:"post"
                }
            },{
                $lookup:{
                    from:"followers",
                    let:{userId:req.user._id,agentId:"$user"},
                    pipeline:[
                        {
                            $match:{
                                $expr:{
                                    $and:[
                                        {
                                            $eq:["$user","$$agentId"]
                                            
                                        },{
                                            $eq:["$follower","$$userId"]
                                        }
                                    ]
                                }
                            }
                        },
                        { $project: { user:0,follower:0,createdAt:0,updatedAt:0,_id: 0,__v:0 } }
                    ],
                    as:"follow"
                }
            },
            { $project: { _id:1,fileUrl:1,message:1,type:1,likes:1,comments:1,fileHeight:1,
                feeling:1,createdAt:1,updatedAt:1,status:1,"post":1,"follow":1,"user": 1,"userName": 1,"userPhoto": 1} }
        ])

        const response = {
            total:size,
            pageSize:parseInt(req.query.limit),
            start:skip,
            end:skip+itemList.length,
            data:itemList 
        }

        res.send(response)

   }catch(e){
       res.status(400).send({error:e.message})
   }
})

router.get('/api/post',auth, async (req,res) => {

    const sort = {}

    if(req.query.sortBy){
        const parts = req.query.sortBy.split(":")
        sort[parts[0]] = parts[1] ==='desc' ? -1 : 1
    }

    try{
        // const itemList =await UserPost.find({},null,{
        //     limit:parseInt(req.query.limit),
        //     skip:parseInt(req.query.skip),
        //     sort
        // }).populate('user',['userName','photo'])
        const date = new Date()
        date.setDate(date.getDate() - 20);
        const itemList = await UserPost.aggregate([
            {
              $match:{status:1,updatedAt:{$gt:date}}
            },
            {
                $sort:sort
            },{
                $skip:parseInt(req.query.skip)
            },{
                $limit:parseInt(req.query.limit)
            },{
                $lookup:{
                    from:"postlikes",
                    let:{userId:req.user._id,postId:"$_id"},
                    pipeline:[
                        {
                            $match:{
                                $expr:{
                                    $and:[
                                        {
                                            $eq:["$user","$$userId"]
                                            
                                        },{
                                            $eq:["$userpost","$$postId"]
                                        }
                                    ]
                                }
                            }
                        },
                        { $project: { user:0,userpost:0,createdAt:0,updatedAt:0,_id: 0,__v:0 } }
                    ],
                    as:"post"
                }
            },{
                $lookup:{
                    from:"followers",
                    let:{userId:req.user._id,agentId:"$user"},
                    pipeline:[
                        {
                            $match:{
                                $expr:{
                                    $and:[
                                        {
                                            $eq:["$user","$$agentId"]
                                            
                                        },{
                                            $eq:["$follower","$$userId"]
                                        }
                                    ]
                                }
                            }
                        },
                        { $project: { user:0,follower:0,createdAt:0,updatedAt:0,_id: 0,__v:0 } }
                    ],
                    as:"follow"
                }
            },{
                $lookup:{
                    from:"users",
                    localField:"user",
                    foreignField:"_id",
                    as:"user"
                },
                
            },{
                $unwind:"$user"
            },{ $project: { _id:1,fileUrl:1,message:1,type:1,likes:1,comments:1,fileHeight:1,
                feeling:1,createdAt:1,updatedAt:1,"post":1,"follow":1,"user._id": 1,"user.userName": 1,"user.photo": 1} }
        ])

        res.send(itemList)
   }catch(e){
       res.status(400).send({error:e.message})
   }
})

router.get('/api/v1/my_post',auth, async (req,res) => {

    const sort = {}
    const match = {
        status:{$ne:0},
        user:req.user._id
    }
    let skip = parseInt(req.query.skip)
    if(req.query.sortBy){
        const parts = req.query.sortBy.split(":")
        sort[parts[0]] = parts[1] ==='desc' ? -1 : 1
    }

    if(req.query.syncDate){
        const date = new Date(req.query.syncDate)
        console.log(date)
        if(req.query.type.toString() === 'append'){
            match.updatedAt={$lt:date}
        }else{
            match.updatedAt={$gt:date}
        }
        skip = 0
    }

    try{
         const size = await UserPost.countDocuments({status:1})

         const itemList = await UserPost.aggregate([
            {
              $match:match
            },
            {
                $sort:sort
            },{
                $skip:skip 
            },{
                $limit:parseInt(req.query.limit)
            },{
                $lookup:{
                    from:"postlikes",
                    let:{userId:req.user._id,postId:"$_id"},
                    pipeline:[
                        {
                            $match:{
                                $expr:{
                                    $and:[
                                        {
                                            $eq:["$user","$$userId"]
                                            
                                        },{
                                            $eq:["$userpost","$$postId"]
                                        }
                                    ]
                                }
                            }
                        },
                        { $project: { user:0,userpost:0,createdAt:0,updatedAt:0,_id: 0,__v:0 } }
                    ],
                    as:"post"
                }
            },{
                $lookup:{
                    from:"followers",
                    let:{userId:req.user._id,agentId:"$user"},
                    pipeline:[
                        {
                            $match:{
                                $expr:{
                                    $and:[
                                        {
                                            $eq:["$user","$$agentId"]
                                            
                                        },{
                                            $eq:["$follower","$$userId"]
                                        }
                                    ]
                                }
                            }
                        },
                        { $project: { user:0,follower:0,createdAt:0,updatedAt:0,_id: 0,__v:0 } }
                    ],
                    as:"follow"
                }
            },
            { $project: { _id:1,fileUrl:1,message:1,type:1,likes:1,comments:1,fileHeight:1,
                feeling:1,createdAt:1,updatedAt:1,status:1,"post":1,"follow":1,"user": 1,"userName": 1,"userPhoto": 1} }
        ])

        const response = {
            total:size,
            pageSize:parseInt(req.query.limit),
            start:skip,
            end:skip+itemList.length,
            data:itemList 
        }

        res.send(response)

   }catch(e){
       res.status(400).send({error:e.message})
   }
})

router.get('/api/my_post',auth, async (req,res) => {

    const sort = {}

    if(req.query.sortBy){
        const parts = req.query.sortBy.split(":")
        sort[parts[0]] = parts[1] ==='desc' ? -1 : 1
    }

    try{
        // const itemList =await UserPost.find({},null,{
        //     limit:parseInt(req.query.limit),
        //     skip:parseInt(req.query.skip),
        //     sort
        // }).populate('user',['userName','photo'])
        const date = new Date()
        date.setDate(date.getDate() - 20);
        const itemList = await UserPost.aggregate([
            {
               $match:{user:req.user._id,status:{$ne:0},updatedAt:{$gt:date}}
            },
            {
                $sort:sort
            },{
                $limit:parseInt(req.query.limit)
            },{
                $skip:parseInt(req.query.skip)
            },{
                $lookup:{
                    from:"postlikes",
                    let:{userId:req.user._id,postId:"$_id"},
                    pipeline:[
                        {
                            $match:{
                                $expr:{
                                    $and:[
                                        {
                                            $eq:["$user","$$userId"]
                                            
                                        },{
                                            $eq:["$userpost","$$postId"]
                                        }
                                    ]
                                }
                            }
                        },
                        { $project: { user:0,userpost:0,createdAt:0,updatedAt:0,_id: 0,__v:0 } }
                    ],
                    as:"post"
                }
            },{
                    $lookup:{
                        from: "users",
                        localField: "user",
                        foreignField: "_id",
                        as: "user"
                    }
            },{$unwind: '$user'}
            ,{ $project: { _id:1,"user._id":1,"user.userName":1,
            "user.photo":1,fileUrl:1,message:1,type:1,likes:1,comments:1,fileHeight:1,
                feeling:1,createdAt:1,updatedAt:1,status:1,"post":1} }
        ])
        res.send(itemList)
   }catch(e){
       res.status(400).send({error:e.message})
   }
})

router.patch('/api/post/:id',auth,async (req,res) => {

    const updates = Object.keys(req.body)
    const allowedUpdates = ['message','type','fileUrl','feeling']

    const isValidUpdate = updates.every((update) => allowedUpdates.includes(update))
    if(!isValidUpdate){
        return res.status(400).send({error:'Invalid updates!'})
    } 
    try{
        const post = await UserPost.findOne({_id:req.params.id.toString()})
               .populate("user",['userName','photo'])
        if(post.user._id.toString() !== req.user._id.toString()){
            return res.status(400).send({error:"You are not authorize to update this post."})
        }
        updates.forEach((update) => post[update] = req.body[update])
        await post.save()
        res.send(post)
    }catch(e){
        res.status(400).send({error:e.message})
    }
})

router.delete('/api/post/:id',auth,async (req,res) => {
    try{
        const post = await UserPost.findOne({_id:req.params.id})
        if(!post){
            res.status(404).send({message:'No post found.'})
        }
        if(post.user.toString() !== req.user._id.toString()){
            return res.status(400).send({error:"You are not authorize to delete this post."})
        }
        post.status = 0
        await post.save()
        res.send(post)
    }catch(e){
        res.status(400).send({error:e.message})
    }
})

router.patch('/api/post_like',auth,async (req,res) => {

    try{
        //const post = await UserPost.findOne({_id:req.body.id.toString()})
        const likes = parseInt(req.body.likes)
        // post.likes = post.likes + likes
        // if(post.likes < 0){
        //     post.likes = 0
        // }
        //await post.save()
        const post = await UserPost.findOneAndUpdate({ _id:req.body.id.toString() }
                 , { $inc: { likes: likes } },{ timestamps: false });
        if(likes === -1){
            const postLike = await PostLike.findOne({user:req.user._id.toString(),
                userpost:post._id})
            await postLike.delete()   
        }else{
            const postLike = new PostLike({
                user:req.user._id,
                userpost:post._id
            })
            await postLike.save()
        }
        
        res.send(post)
    }catch(e){
        res.status(400).send({error:e.message})
    }
})


router.post('/api/story',auth,async (req,res) => {

    const story = new UserStory({
        ...req.body,
        user:req.user._id
    })
    try{
         await story.save()
         res.status(201).send(story)
    }catch(e){
        res.status(400).send({error:e.message})
    }
})

router.get('/api/story',auth, async (req,res) => {

    try{
        const sort = {}
        if(req.query.sortBy){
            const parts = req.query.sortBy.split(":")
            sort[parts[0]] = parts[1] ==='desc' ? -1 : 1
        }else{

        }

        const date = new Date()
        date.setDate(date.getDate() - 1);
        const itemList = await UserStory.find({user:req.query.id},null,{
            sort
        })
        res.send(itemList)
   }catch(e){
       res.status(400).send({error:e.message})
   }
})

router.get('/api/story_users',auth, async (req,res) => {

    const sort = {}

    if(req.query.sortBy){
        const parts = req.query.sortBy.split(":")
        sort[parts[0]] = parts[1] ==='desc' ? -1 : 1
    }

    try{
        const itemList = await UserStory.aggregate( [ 
            {
                $sort:sort
            },{
                $limit:parseInt(req.query.limit)
            },{
                $skip:parseInt(req.query.skip)
            },
            { 
                $group : 
                {
                    _id : "$user" 
                } 
            },
            {
                $lookup:{
                    from:"users",
                    localField:"_id",
                    foreignField:"_id",
                    as:"user"
                },
                
            },
            {
                $unwind:"$user"
            },{ $project: { _id:0,"user._id": 1,"user.code": 1,"user.userName": 1,"user.photo": 1} }
        ])
        res.send(itemList)
   }catch(e){
       res.status(400).send({error:e.message})
   }
})

router.get('/api/my_story',auth, async (req,res) => {

    const sort = {}

    if(req.query.sortBy){
        const parts = req.query.sortBy.split(":")
        sort[parts[0]] = parts[1] ==='desc' ? -1 : 1
    }

    try{
        const date = new Date()
        date.setDate(date.getDate() - 1);
        const itemList =await UserStory.find({user:req.user._id,createdAt:{$gt:date},status:1},null,{
            limit:parseInt(req.query.limit),
            skip:parseInt(req.query.skip),
            sort
        }).populate('user',['userName','photo'])
        res.send(itemList)
   }catch(e){
       res.status(400).send({error:e.message})
   }
})

router.delete('/api/my_story/:id',auth, async (req,res) => {

    try{
        const story = await UserStory.findOne({_id:req.params.id})
        if(!story){
            res.status(404).send({message:'No story found.'})
        }
        if(story.user.toString() !== req.user._id.toString()){
            return res.status(400).send({error:"You are not authorize to delete this story."})
        }
        
       // story.delete()
        story.status = 0
        await story.save()
        res.send({story,message:'Story has been deleted successfully.'})
   }catch(e){
       res.status(400).send({error:e.message})
   }
})



module.exports = router