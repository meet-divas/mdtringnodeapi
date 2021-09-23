const express = require('express')
const auth = require('../middleware/auth')
const User = require('../models/user')
const ChatUser = require('../models/chat_user')
require('../db/mongoose') 

const router = new express.Router()

router.post('/api/chat_user',auth,async (req,res) => {
    try{
         let chatUser = await ChatUser.findOne({$or:[
            {sender:req.user._id,receiver:req.body.receiver},
            {sender:req.body.receiver,receiver:req.user._id},
           ]}) 
         if(chatUser){
           // res.status(400).send({error:'User is already exist.'})
            return res.status(201).send(chatUser)
         }else{
            chatUser = new ChatUser({
                ...req.body,
                sender:req.user._id
            })

            await chatUser.save()
            res.status(201).send(chatUser)
         }
         
    }catch(e){
        res.status(500).send({error:e.message})
    }
})

router.get('/api/chat_user',auth,async (req,res) =>{
    try{
        const sort = {}

        if(req.query.sortBy){
            const parts = req.query.sortBy.split(":")
            sort[parts[0]] = parts[1] ==='desc' ? -1 : 1
        }

        const itemList = await ChatUser.find({
            $or:[
                {sender:req.user._id},
                {receiver:req.user._id},
            ],
            deleteByUser :{$ne:req.user._id.toString()}
        },null,{
            limit:parseInt(req.query.limit),
            skip:parseInt(req.query.skip),
            sort
        })
        .populate('sender',['userName','photo','vipExpire'])
        .populate('receiver',['userName','photo','vipExpire'])

        res.send(itemList)

    }catch(e){
        res.status(500).send({error:e.message})
    }
})

router.patch('/api/chat_user',auth,async (req,res) => {

    const updates = Object.keys(req.body)
    const allowedUpdates = ['lastMessage','lastMessageDate','lastMessageRead',
                     'unReadCounter','sender','receiver']

    const isValidUpdate = updates.every((update) => allowedUpdates.includes(update))
    if(!isValidUpdate){
        return res.status(400).send({error:'Invalid updates!'})
    } 

    try{
         let chatUser = await ChatUser.findOne({
             $or:[
                 {
                    $and:[
                        {sender:req.user._id},
                        {receiver:req.body.receiver}
                    ]
                 },{
                    $and:[
                        {sender:req.body.receiver},
                        {receiver:req.user._id}
                    ]
                 }
                
             ]
             
         }) 
         console.log(chatUser)
         if(!chatUser){
            res.status(404).send({error:'User not found.'})
         }else{
            if(chatUser.sender.toString() === req.body.receiver.toString()){
                chatUser.sender = req.user._id
                chatUser.receiver = req.body.receiver
             }
            updates.forEach((update) => chatUser[update] = req.body[update])
            await chatUser.save()
            res.send(chatUser)
         }
         
    }catch(e){
        res.status(500).send({error:e.message})
    }
})

router.delete('/api/chat_user',auth,  async (req,res) => {
    try{
         const users = req.body
         users.forEach(async (user) => {
            console.log(user.id)
            const chatUser = await ChatUser.findById({_id:user.id})
            if(!chatUser){
                return 
            }
            if(chatUser.deleteByUser){
                await chatUser.remove()
            }else{
                chatUser.deleteByUser = req.user._id.toString()
                await chatUser.save()
            }
         })
        
         res.send(true)
    }catch(e){
        res.status(400).send({
            error:e.message
        })
    }
})


module.exports = router