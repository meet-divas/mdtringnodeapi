const express = require('express')
require('../../db/mongoose')
const UserPost = require('../../models/userPost')
const auth = require('../../middleware/auth')
const {push} = require('../../firebase/firebaseAdmin')
const User = require('../../models/user')
const router = new express.Router()

router.get('/api/admin/post',auth, async (req,res) => {

    if(req.user.userType !== 'admin'){
        return res.status(403).send({error:'Unauthorized access.'})
    }

    const sort = {}

    if(req.query.sortBy){
        const parts = req.query.sortBy.split(":")
        sort[parts[0]] = parts[1] ==='desc' ? -1 : 1
    }

    try{
        const itemList =await UserPost.find({status:1},null,{
            limit:parseInt(req.query.limit),
            skip:parseInt(req.query.skip),
            sort
        }).populate('user',['userName','photo'])
        res.send(itemList)
   }catch(e){
       res.status(400).send({error:e.messsage})
   }
})

router.get('/api/admin/post/:id',auth, async (req,res) => {

    if(req.user.userType !== 'admin'){
        return res.status(403).send({error:'Unauthorized access.'})
    }

    const sort = {}

    if(req.query.sortBy){
        const parts = req.query.sortBy.split(":")
        sort[parts[0]] = parts[1] ==='desc' ? -1 : 1
    }

    try{
        const itemList =await UserPost.find({user:req.params.id,status:1},null,{
            limit:parseInt(req.query.limit),
            skip:parseInt(req.query.skip),
            sort
        }).populate('user',['userName','photo'])
        res.send(itemList)
   }catch(e){
       res.status(400).send({error:e.messsage})
   }
})

router.delete('/api/admin/post',auth, async (req,res) => {

    try{
        if(req.user.userType !== 'admin'){
            return res.status(403).send({error:'Unauthorized access.'})
        }

        const postId = req.query.id.toString()
        const post = await UserPost.findOne({_id:postId})

         if(!post){
            return res.status(404).send();
         }

         post.status = 2
         await post.save()
         const user = await User.findOne({_id:post.user})
         const body = {
            postId:post._id.toString(),
            postMessage:post.message,
            flag:'postDeleted'
        }
        const response  = await push(user.fcmToken,body)

        return res.send(true)

   }catch(e){
       console.log(JSON.stringify(e))
       res.status(400).send({error:e.messsage})
   }
})


module.exports = router